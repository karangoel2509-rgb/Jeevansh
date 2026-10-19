import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function registerDonor(data) {
  const payload = {
    name: data.name,
    phone: data.phone,
    blood_type: data.bloodType,
    latitude: 28.6139, // Default to Delhi for demo
    longitude: 77.2090,
    city: data.location || "Delhi",
    age: data.age ? parseInt(data.age) : null,
    weight: data.weight ? parseFloat(data.weight) : null,
    gender: data.gender || null,
    last_donated_at: data.lastDonated ? new Date(data.lastDonated).toISOString() : null,
  };
  
  const res = await axios.post(`${API_URL}/donors/register`, payload);
  return res.data;
}

export async function loginDonor(phone) {
  try {
    const res = await axios.get(`${API_URL}/donors/me/demo-login`);
    return res.data;
  } catch (e) {
    return { token: 'mock-token', donor: { id: '65f1a2b3c4d5e6f7a8b9c0d1', name: 'Rahul Sharma', blood_type: 'O-', phone: '+919876543210' } };
  }
}

export async function getDonorDashboard(donorId) {
  return { totalDonations: 5, livesImpacted: 15, badges: ['First Drop', 'Hero'], available: true };
}

export async function getPendingRequests(donorId) {
  const res = await axios.get(`${API_URL}/donors/me/pending-requests?donor_id=${donorId}`);
  return res.data.requests || [];
}

export async function acceptRequest(donorId, requestId) {
  const res = await axios.post(`${API_URL}/donors/me/accept/${requestId}?donor_id=${donorId}`);
  return res.data;
}

export async function getCertificates(donorId) {
  const res = await axios.get(`${API_URL}/donors/me/certificates?donor_id=${donorId}`);
  return res.data.certificates || [];
}

export async function getCertificateById(certId) {
  const res = await axios.get(`${API_URL}/donors/me/certificates/${certId}`);
  return res.data;
}