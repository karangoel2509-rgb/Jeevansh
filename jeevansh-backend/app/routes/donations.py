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


# ─────────────────────────────────────────────────────────────
# Hardcoded bank credentials for the hackathon demo
# In production, this would query a "banks" collection with hashed passwords
# ─────────────────────────────────────────────────────────────
BANK_CREDENTIALS = {
    "bank-1": {"password": "city123", "name": "City Hospital Blood Bank"},
    "bank-2": {"password": "redcross123", "name": "Red Cross Society"},
    "bank-3": {"password": "govt123", "name": "Govt Medical College Blood Bank"},
}


# ─────────────────────────────────────────────────────────────
# BANK LOGIN
# ─────────────────────────────────────────────────────────────
@router.post("/api/banks/login")
async def bank_login(payload: BankLoginRequest):
    """Login for blood bank officers using hardcoded credentials."""
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


# ─────────────────────────────────────────────────────────────
# VERIFY DONATION (QR scan → confirm)
# ─────────────────────────────────────────────────────────────
@router.post("/api/donations/verify", response_model=DonationResponse)
async def verify_donation(payload: DonationVerifyRequest):
    """
    Verify a donation by decoding the QR token.

    This is called when the bank scans the donor's QR code.
    Steps:
      1. Decode the JWT
      2. Find the request + donor in MongoDB
      3. Update donor's last_donated_at and total_donations
      4. Mark the request as completed
      5. Return success + donor info
    """
    db = get_db()

    # 1. Decode token
    try:
        decoded = verify_donation_token(payload.token)
    except jose_jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="QR code has expired")
    except jose_jwt.InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid or malformed QR code")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or malformed QR code")

    donor_id = decoded["donor_id"]
    request_id = decoded["request_id"]
    donor_name = decoded.get("donor_name", "Unknown")

    # 2. Find donor
    try:
        donor_oid = ObjectId(donor_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid donor ID in token")

    donor = await db.donors.find_one({"_id": donor_oid})
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    # 3. Find request
    try:
        request_oid = ObjectId(request_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid request ID in token")

    blood_request = await db.requests.find_one({"_id": request_oid})
    if not blood_request:
        raise HTTPException(status_code=404, detail="Request not found")

    # 4. Update donor: last_donated_at + total_donations
    now = datetime.utcnow()
    await db.donors.update_one(
        {"_id": donor_oid},
        {
            "$set": {
                "last_donated_at": now,
                "is_available": False,
            },
            "$inc": {"total_donations": 1},
        },
    )

    # 5. Mark request as completed
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

    # 6. Log the donation in a donations collection
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


# ─────────────────────────────────────────────────────────────
# DONATION HISTORY
# ─────────────────────────────────────────────────────────────
@router.get("/api/donations/history")
async def donation_history(bank_id: str = None, limit: int = 50):
    """Return recent verified donations (optionally filtered by bank)."""
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