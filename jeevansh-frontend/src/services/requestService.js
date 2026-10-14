import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// 1. Mock banks for now (Phase 4 will make this real)
export async function checkBanks(bloodType) {
  const mockBanks = [
    { id: 'bank-1', name: 'City Hospital Blood Bank', distance: 3.2, stock: { 'B+': 4, 'O+': 2 } },
    { id: 'bank-2', name: 'Red Cross Society', distance: 7.8, stock: { 'B+': 0, 'O-': 1 } },
    { id: 'bank-3', name: 'Govt Medical College', distance: 12.1, stock: { 'B+': 2, 'A+': 5 } },
  ];
  return mockBanks.map((b) => ({
    ...b,
    hasStock: (b.stock[bloodType] || 0) > 0,
    unitsAvailable: b.stock[bloodType] || 0,
  })).sort((a, b) => a.distance - b.distance);
}

// 2. Create a REAL request via FastAPI
export async function createRequest(data) {
  // We need lat/lng for the backend. If the user didn't provide a real location, 
  // we default to the center of Delhi NCR so the demo works smoothly.
  const payload = {
    blood_type: data.bloodType,
    latitude: 28.6139, 
    longitude: 77.2090,
    patient_age: parseInt(data.patientAge) || null,
    patient_gender: data.patientGender || null,
    units: parseInt(data.units) || 1,
    hospital_name: data.hospital || null,
    location_text: data.location || null,
  };

  const res = await axios.post(`${API_URL}/requests`, payload);
  
  return {
    id: res.data.id, // This is the full MongoDB ID
    blood_type: res.data.blood_type,
    status: res.data.status,
    alerted_donors: res.data.alerted_donors,
    matchedDonors: res.data.matched_donors,
    created_at: res.data.created_at,
  };
}

// 3. Poll the REAL status from FastAPI
export async function getRequestStatus(requestId) {
  const res = await axios.get(`${API_URL}/requests/${requestId}/status`);
  return res.data;
}