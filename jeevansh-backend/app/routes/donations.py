from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timezone
from bson import ObjectId
import jwt as jose_jwt

from app.database import get_db
from app.models.donation import (
    BankLoginRequest,
    DonationScanRequest,
    DonationActionRequest,
    DonationResponse,
)
from app.services.qr_service import verify_donation_token

router = APIRouter(tags=["donations"])

BANK_CREDENTIALS = {
    "bank-1": {"password": "city123", "name": "City Hospital Blood Bank"},
    "bank-2": {"password": "redcross123", "name": "Red Cross Society"},
    "bank-3": {"password": "govt123", "name": "Govt Medical College Blood Bank"},
}

@router.post("/api/banks/login")
async def bank_login(payload: BankLoginRequest):
    bank = BANK_CREDENTIALS.get(payload.bank_id)
    if not bank or bank["password"] != payload.password:
        raise HTTPException(status_code=401, detail="Invalid bank ID or password")
    return {
        "success": True,
        "token": f"mock-bank-token-{payload.bank_id}-{datetime.now(timezone.utc).timestamp()}",
        "bank": {"id": payload.bank_id, "name": bank["name"]},
    }

@router.post("/api/donations/scan")
async def scan_donation_qr(payload: DonationScanRequest):
    """Step 1: Bank scans the QR. Status becomes at_blood_bank."""
    db = get_db()
    try:
        decoded = verify_donation_token(payload.token)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired QR code")

    donor_id = decoded["donor_id"]
    request_id = decoded["request_id"]

    try:
        request_oid = ObjectId(request_id)
        donor_oid = ObjectId(donor_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid IDs in token")

    blood_request = await db.requests.find_one({"_id": request_oid})
    if not blood_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if blood_request.get("status") != "donor_found":
        raise HTTPException(status_code=400, detail="Request is not in a valid state to be scanned")

    donor = await db.donors.find_one({"_id": donor_oid})
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    # Update request status to at_blood_bank
    await db.requests.update_one(
        {"_id": request_oid},
        {"$set": {"status": "at_blood_bank", "scanned_at": datetime.now(timezone.utc)}}
    )

    return {
        "success": True,
        "message": "QR Code Scanned. Please perform medical screening.",
        "donor_name": donor["name"],
        "blood_type": donor["blood_type"],
        "request_id": request_id
    }

@router.post("/api/donations/approve", response_model=DonationResponse)
async def approve_donation(payload: DonationActionRequest):
    """Step 2a: Bank approves donation after medical test. Certificate generated."""
    db = get_db()
    try:
        request_oid = ObjectId(payload.request_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid request ID")

    blood_request = await db.requests.find_one({"_id": request_oid})
    if not blood_request or blood_request.get("status") != "at_blood_bank":
        raise HTTPException(status_code=400, detail="Request is not ready to be approved")

    accepted_donor = blood_request.get("accepted_donor")
    if not accepted_donor:
        raise HTTPException(status_code=400, detail="No donor attached to this request")

    donor_oid = ObjectId(accepted_donor["id"])
    donor = await db.donors.find_one({"_id": donor_oid})
    now = datetime.now(timezone.utc)

    # 1. Update Donor Stats
    await db.donors.update_one(
        {"_id": donor_oid},
        {"$set": {"last_donated_at": now, "is_available": False}, "$inc": {"total_donations": 1}}
    )

    # 2. Update Request Status to Completed
    await db.requests.update_one(
        {"_id": request_oid},
        {"$set": {"status": "completed", "completed_at": now, "verified_by_bank": payload.bank_id}}
    )

    # 3. Create Donation Record (Generates the Certificate)
    await db.donations.insert_one({
        "donor_id": str(donor["_id"]),
        "request_id": payload.request_id,
        "bank_id": payload.bank_id,
        "verified_at": now,
        "donor_name": donor["name"],
        "blood_type": donor["blood_type"],
    })

    return DonationResponse(
        success=True,
        message=f"Donation Approved. Certificate generated for {donor['name']}.",
        donor_name=donor["name"],
        blood_type=donor["blood_type"],
        request_id=payload.request_id,
        verified_at=now
    )

@router.post("/api/donations/reject")
async def reject_donation(payload: DonationActionRequest):
    """Step 2b: Bank rejects donation. Request goes back to searching."""
    db = get_db()
    try:
        request_oid = ObjectId(payload.request_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid request ID")

    blood_request = await db.requests.find_one({"_id": request_oid})
    if not blood_request or blood_request.get("status") != "at_blood_bank":
        raise HTTPException(status_code=400, detail="Request is not ready to be rejected")

    accepted_donor = blood_request.get("accepted_donor")
    if not accepted_donor:
        raise HTTPException(status_code=400, detail="No donor attached to this request")

    donor_id = accepted_donor["id"]

    # 1. Update Request: Back to searching, remove accepted donor, add to rejected list
    await db.requests.update_one(
        {"_id": request_oid},
        {
            "$set": {"status": "searching", "accepted_donor": None},
            "$addToSet": {"rejected_by": donor_id} # Prevent this donor from seeing this request again
        }
    )

    return {"success": True, "message": "Donor rejected. Request is back in the searching pool."}

@router.get("/api/donations/history")
async def donation_history(bank_id: str = None, limit: int = 50):
    db = get_db()
    query = {}
    if bank_id:
        query["bank_id"] = bank_id
    cursor = db.donations.find(query).sort("verified_at", -1).limit(limit)
    donations = []
    async for doc in cursor:
        donations.append({
            "id": str(doc["_id"]),
            "donor_name": doc.get("donor_name"),
            "blood_type": doc.get("blood_type"),
            "bank_id": doc.get("bank_id"),
            "verified_at": doc.get("verified_at"),
        })
    return {"count": len(donations), "donations": donations}