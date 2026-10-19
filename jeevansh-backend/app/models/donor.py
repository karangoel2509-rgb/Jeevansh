from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime

BloodType = Literal["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]

class DonorRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    blood_type: BloodType
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    city: Optional[str] = None
    
    # NEW ELIGIBILITY FIELDS
    age: Optional[int] = None
    weight: Optional[float] = None
    gender: Optional[str] = None
    last_donated_at: Optional[datetime] = None

    @field_validator("phone")
    @classmethod
    def clean_phone(cls, v: str) -> str:
        return v.replace(" ", "").replace("-", "")