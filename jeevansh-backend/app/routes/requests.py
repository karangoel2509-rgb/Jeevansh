from app.services.qr_service import generate_donation_token, generate_qr_image_base64
from app.services.whatsapp_service import send_donor_alert
from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from datetime import datetime
from bson import ObjectId
from app.database import get_db
from app.models.request import BloodRequestCreate
from app.services.geo_search import find_nearby_donors

router = APIRouter(prefix="/api/requests", tags=["requests"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_request(payload: BloodRequestCreate, background_tasks: BackgroundTasks):
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

    # --- TEMPORARY TEST: Send only to myself ---
    background_tasks.add_task(
        send_donor_alert,
        donor_phone="+918218655336",  # <--- PUT YOUR REAL NUMBER HERE
        blood_type=payload.blood_type,
        hospital=payload.hospital_name,
        distance=5.0
    )
    # -------------------------------------------

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

@router.post("/{request_id}/simulate-accept")
async def simulate_donor_accept(request_id: str, donor_phone: str = None):
    """
    DEMO ONLY: Simulate a donor accepting the request.

    In production, this is triggered by the WhatsApp webhook when a donor replies YES.
    This endpoint lets us test the QR verification flow without WhatsApp.
    """
    db = get_db()

    # 1. Find the request
    try:
        oid = ObjectId(request_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid request ID")

    blood_request = await db.requests.find_one({"_id": oid})
    if not blood_request:
        raise HTTPException(status_code=404, detail="Request not found")

    if blood_request.get("status") == "completed":
        raise HTTPException(status_code=400, detail="Request already completed")

    # 2. Pick a donor from the matched list
    matched_ids = blood_request.get("matched_donor_ids", [])
    if not matched_ids:
        raise HTTPException(status_code=400, detail="No matched donors for this request")

    donor_oid = None
    if donor_phone:
        donor = await db.donors.find_one({"phone": donor_phone})
        if donor:
            donor_oid = donor["_id"]

    if not donor_oid:
        # Pick the first matched donor by default
        try:
            donor_oid = ObjectId(matched_ids[0])
        except Exception:
            raise HTTPException(status_code=500, detail="Invalid donor ID in matched list")

    donor = await db.donors.find_one({"_id": donor_oid})
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    # 3. Generate the QR token + QR image
    token = generate_donation_token(
        donor_id=str(donor["_id"]),
        request_id=request_id,
        donor_name=donor["name"],
    )

    # The QR contains this URL. When scanned, the /verify/:token page opens.
    verify_url = f"http://localhost:3000/verify/{token}"
    qr_base64 = generate_qr_image_base64(verify_url)

    # 4. Update the request with accepted donor info
    await db.requests.update_one(
        {"_id": oid},
        {
            "$set": {
                "status": "donor_found",
                "accepted_donor": {
                    "id": str(donor["_id"]),
                    "name": donor["name"],
                    "phone": donor["phone"],
                    "blood_type": donor["blood_type"],
                    "accepted_at": datetime.utcnow(),
                },
                "donation_token": token,
            }
        },
    )

    return {
        "success": True,
        "message": f"{donor['name']} has accepted the request.",
        "donor": {
            "id": str(donor["_id"]),
            "name": donor["name"],
            "phone": donor["phone"],
            "blood_type": donor["blood_type"],
        },
        "token": token,
        "verify_url": verify_url,
        "qr_image_base64": qr_base64,
    }