from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from bson import ObjectId
import jwt as jose_jwt

from app.database import get_db
from app.models.donation import (
    BankLoginRequest,
    DonationVerifyRequest,
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid bank ID or password",
        )

    return {
        "success": True,
        "token": f"mock-bank-token-{payload.bank_id}-{datetime.utcnow().timestamp()}",
        "bank": {
            "id": payload.bank_id,
            "name": bank["name"],
        },
    }

@router.post("/api/donations/verify", response_model=DonationResponse)
async def verify_donation(payload: DonationVerifyRequest):
    db = get_db()

    try:
        decoded = verify_donation_token(payload.token)
    except jose_jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="QR code has expired")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or malformed QR code")

    donor_id = decoded["donor_id"]
    request_id = decoded["request_id"]

    donor_oid = ObjectId(donor_id)
    request_oid = ObjectId(request_id)

    blood_request = await db.requests.find_one({"_id": request_oid})
    if not blood_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Prevent double verification
    if blood_request.get("status") == "completed":
        raise HTTPException(status_code=400, detail="This donation has already been verified")

    donor = await db.donors.find_one({"_id": donor_oid})
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    now = datetime.utcnow()
    
    # Update Donor: last_donated_at + total_donations
    await db.donors.update_one(
        {"_id": donor_oid},
        {
            "$set": {"last_donated_at": now, "is_available": False},
            "$inc": {"total_donations": 1},
        },
    )

    # Update Request to completed
    await db.requests.update_one(
        {"_id": request_oid},
        {
            "$set": {
                "status": "completed",
                "completed_at": now,
                "verified_by_bank": payload.bank_id,
            }
        },
    )

    # Create Donation Log (This is what the Donor Dashboard fetches for Certificates)
    await db.donations.insert_one({
        "donor_id": donor_id,
        "request_id": request_id,
        "bank_id": payload.bank_id,
        "verified_at": now,
        "donor_name": donor["name"],
        "blood_type": donor["blood_type"],
    })

    return DonationResponse(
        success=True,
        message=f"Thank you, {donor['name']}! Your donation has been verified.",
        donor_name=donor["name"],
        blood_type=donor["blood_type"],
        request_id=request_id,
        verified_at=now,
    )

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