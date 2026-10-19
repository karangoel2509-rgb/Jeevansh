from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timedelta, timezone # <-- Import timezone
from bson import ObjectId
from app.database import get_db
from app.models.donor import DonorRegister
from app.services.geo_search import find_nearby_donors
from app.services.acceptance_service import accept_request

router = APIRouter(prefix="/api/donors", tags=["donors"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_donor(payload: DonorRegister):
    db = get_db()

    # 1. ENFORCE ELIGIBILITY CRITERIA
    if payload.age is not None and (payload.age < 18 or payload.age > 65):
        raise HTTPException(status_code=400, detail="Donor must be between 18 and 65 years old.")
    
    if payload.weight is not None and payload.weight < 45.0:
        raise HTTPException(status_code=400, detail="Donor must weigh at least 45 kg.")
        
    if payload.last_donated_at is not None:
        # FIX: Ensure both dates are timezone-aware before subtracting
        now = datetime.now(timezone.utc)
        last_donated = payload.last_donated_at
        if last_donated.tzinfo is None:
            last_donated = last_donated.replace(tzinfo=timezone.utc)
            
        days_since = (now - last_donated).days
        if days_since < 90:
            raise HTTPException(
                status_code=400, 
                detail=f"Donor must wait 90 days between donations. Please wait {90 - days_since} more days."
            )

    # 2. Check for duplicate phone
    existing = await db.donors.find_one({"phone": payload.phone})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A donor with this phone number already exists.",
        )

    # 3. Save to Database
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
        "created_at": datetime.now(timezone.utc), # Also updated this to be safe
        "age": payload.age,
        "weight": payload.weight,
        "gender": payload.gender,
    }

    result = await db.donors.insert_one(donor_doc)

    return {
        "success": True,
        "donor_id": str(result.inserted_id),
        "message": f"Welcome, {payload.name}! You'll receive WhatsApp alerts for nearby requests.",
    }

# ... KEEP THE REST OF THE FILE EXACTLY AS IT IS ...
@router.get("/count")
async def donor_count():
    db = get_db()
    count = await db.donors.count_documents({})
    return {"total_donors": count}

@router.post("/search")
async def search_donors(blood_type: str, latitude: float, longitude: float, radius_km: float = 15):
    donors = await find_nearby_donors(blood_type, latitude, longitude, radius_km)
    return {"count": len(donors), "donors": donors}

@router.get("/me/pending-requests")
async def get_pending_requests(donor_id: str):
    db = get_db()
    cursor = db.requests.find({"status": "searching", "matched_donor_ids": donor_id}).sort("created_at", -1)
    requests = []
    async for doc in cursor:
        requests.append({
            "id": str(doc["_id"]),
            "blood_type": doc["blood_type"],
            "hospital_name": doc.get("hospital_name", "Unknown"),
            "units": doc.get("units", 1),
            "created_at": doc["created_at"]
        })
    return {"count": len(requests), "requests": requests}

@router.post("/me/accept/{request_id}")
async def donor_accepts_request(request_id: str, donor_id: str):
    result = await accept_request(donor_id, request_id, channel="dashboard")
    return result

@router.get("/me/certificates")
async def get_donor_certificates(donor_id: str):
    db = get_db()
    cursor = db.donations.find({"donor_id": donor_id}).sort("verified_at", -1)
    certs = []
    async for doc in cursor:
        certs.append({
            "id": str(doc["_id"]),
            "donor_name": doc["donor_name"],
            "blood_type": doc["blood_type"],
            "request_id": doc["request_id"],
            "verified_at": doc["verified_at"]
        })
    return {"count": len(certs), "certificates": certs}

@router.get("/me/demo-login")
async def demo_login():
    db = get_db()
    latest_request = await db.requests.find_one({"status": "searching"}, sort=[("created_at", -1)])
    if latest_request and latest_request.get("matched_donor_ids"):
        donor_id = latest_request["matched_donor_ids"][0]
        donor = await db.donors.find_one({"_id": ObjectId(donor_id)})
        if donor:
            return {"token": "demo-token", "donor": {"id": str(donor["_id"]), "name": donor["name"], "blood_type": donor["blood_type"], "phone": donor["phone"]}}
    fallback = await db.donors.find_one({"blood_type": "O-"})
    if not fallback:
        fallback = await db.donors.find_one({})
    return {"token": "demo-token", "donor": {"id": str(fallback["_id"]), "name": fallback.get("name", "Demo Donor"), "blood_type": fallback.get("blood_type", "O-"), "phone": fallback.get("phone", "+919876543210")}}

@router.get("/me/certificates/{cert_id}")
async def get_single_certificate(cert_id: str):
    db = get_db()
    try:
        oid = ObjectId(cert_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid certificate ID")
    doc = await db.donations.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return {"id": str(doc["_id"]), "donor_name": doc["donor_name"], "blood_type": doc["blood_type"], "request_id": doc["request_id"], "verified_at": doc["verified_at"], "bank_id": doc.get("bank_id", "Partner Blood Bank")}