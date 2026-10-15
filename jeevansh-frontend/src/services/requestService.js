import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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

export async function createRequest(data) {
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
    ...res.data,
    shortId: res.data.id.slice(-6),
    matchedDonors: res.data.matched_donors || [],
  };
}

export async function getRequestStatus(requestId) {
  const res = await axios.get(`${API_URL}/requests/${requestId}/status`);
  return res.data;
}

// NEW: Simulate a donor accepting the request (demo only)
export async function simulateAccept(requestId, donorPhone = null) {
  const url = donorPhone
    ? `${API_URL}/requests/${requestId}/simulate-accept?donor_phone=${encodeURIComponent(donorPhone)}`
    : `${API_URL}/requests/${requestId}/simulate-accept`;
  const res = await axios.post(url);
  return res.data;
}