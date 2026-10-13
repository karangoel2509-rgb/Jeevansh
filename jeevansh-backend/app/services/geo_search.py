from datetime import datetime, timedelta
from typing import List, Dict
from app.database import get_db
from app.services.compatibility import get_compatible_donor_types

DONATION_GAP_DAYS = 90  # Minimum days between donations

async def find_nearby_donors(
    patient_blood_type: str,
    latitude: float,
    longitude: float,
    radius_km: float = 15,
    limit: int = 20,
) -> List[Dict]:
    """
    Find compatible donors near a location using MongoDB 2dsphere.
    Filters:
      - Compatible blood type
      - Available status
      - Not donated in last 90 days
      - Within radius_km of patient
    """
    db = get_db()
    compatible_types = get_compatible_donor_types(patient_blood_type)
    cutoff_date = datetime.utcnow() - timedelta(days=DONATION_GAP_DAYS)

    query = {
        "blood_type": {"$in": compatible_types},
        "is_available": True,
        "$or": [
            {"last_donated_at": None},
            {"last_donated_at": {"$lt": cutoff_date}},
        ],
        "location": {
            "$near": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [longitude, latitude],  # [lng, lat] — MongoDB order
                },
                "$maxDistance": radius_km * 1000,  # meters
            }
        },
    }

    cursor = db.donors.find(query).limit(limit)
    donors = []
    async for doc in cursor:
        donors.append({
            "id": str(doc["_id"]),
            "name": doc["name"],
            "phone": doc["phone"],
            "blood_type": doc["blood_type"],
            "total_donations": doc.get("total_donations", 0),
        })
    return donors