from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from bson import ObjectId
from app.database import get_db
from app.models.request import BloodRequestCreate
from app.services.geo_search import find_nearby_donors

router = APIRouter(prefix="/api/requests", tags=["requests"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_request(payload: BloodRequestCreate):
    db = get_db()

    # Find compatible donors near the patient
    donors = await find_nearby_donors(
        patient_blood_type=payload.blood_type,
        latitude=payload.latitude,
        longitude=payload.longitude,
        radius_km=15,
        limit=20,
    )

    request_doc = {
        "blood_type": payload.blood_type,
        "location": {
            "type": "Point",
            "coordinates": [payload.longitude, payload.latitude],
        },
        "location_text": payload.location_text,
        "patient_age": payload.patient_age,
        "patient_gender": payload.patient_gender,
        "units": payload.units,
        "hospital_name": payload.hospital_name,
        "status": "searching",
        "alerted_donors": len(donors),
        "matched_donor_ids": [d["id"] for d in donors],
        "accepted_donor": None,
        "created_at": datetime.utcnow(),
    }

    result = await db.requests.insert_one(request_doc)
    request_id = str(result.inserted_id)

    # TODO Phase 3: Send WhatsApp alerts to matched donors here

    return {
        "id": request_id,
        "blood_type": payload.blood_type,
        "status": "searching",
        "alerted_donors": len(donors),
        "matched_donors": donors,
        "created_at": request_doc["created_at"],
        "accepted_donor": None,
    }

@router.get("/{request_id}/status")
async def get_request_status(request_id: str):
    db = get_db()

    try:
        oid = ObjectId(request_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid request ID")

    request_doc = await db.requests.find_one({"_id": oid})
    if not request_doc:
        raise HTTPException(status_code=404, detail="Request not found")

    return {
        "id": str(request_doc["_id"]),
        "blood_type": request_doc["blood_type"],
        "status": request_doc["status"],
        "alerted_donors": request_doc.get("alerted_donors", 0),
        "accepted_donor": request_doc.get("accepted_donor"),
        "created_at": request_doc["created_at"],
    }