from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from app.database import get_db
from app.models.donor import DonorRegister
from app.services.geo_search import find_nearby_donors

router = APIRouter(prefix="/api/donors", tags=["donors"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_donor(payload: DonorRegister):
    db = get_db()

    existing = await db.donors.find_one({"phone": payload.phone})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A donor with this phone number already exists.",
        )

    donor_doc = {
        "name": payload.name,
        "phone": payload.phone,
        "blood_type": payload.blood_type,
        "location": {
            "type": "Point",
            "coordinates": [payload.longitude, payload.latitude],
        },
        "city": payload.city,
        "is_available": True,
        "total_donations": 0,
        "last_donated_at": payload.last_donated_at,
        "created_at": datetime.utcnow(),
    }

    result = await db.donors.insert_one(donor_doc)

    return {
        "success": True,
        "donor_id": str(result.inserted_id),
        "message": f"Welcome, {payload.name}! You'll receive WhatsApp alerts for nearby requests.",
    }

@router.get("/count")
async def donor_count():
    db = get_db()
    count = await db.donors.count_documents({})
    return {"total_donors": count}

@router.post("/search")
async def search_donors(
    blood_type: str,
    latitude: float,
    longitude: float,
    radius_km: float = 15,
):
    """Debug endpoint — test the geo-search directly."""
    donors = await find_nearby_donors(blood_type, latitude, longitude, radius_km)
    return {"count": len(donors), "donors": donors}