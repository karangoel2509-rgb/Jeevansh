import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function loginBank(bankId, password) {
  const res = await axios.post(`${API_URL}/banks/login`, {
    bank_id: bankId,
    password: password,
  });
  return res.data;
}

export async function scanDonationQR(token, bankId = null) {
  const res = await axios.post(`${API_URL}/donations/scan`, {
    token: token,
    bank_id: bankId,
  });
  return res.data;
}

export async function approveDonation(requestId, token, bankId = null) {
  const res = await axios.post(`${API_URL}/donations/approve`, {
    request_id: requestId,
    token: token,
    bank_id: bankId,
  });
  return res.data;
}

export async function rejectDonation(requestId, token, bankId = null) {
  const res = await axios.post(`${API_URL}/donations/reject`, {
    request_id: requestId,
    token: token,
    bank_id: bankId,
  });
  return res.data;
}

export async function getDonationHistory(bankId) {
  const url = bankId ? `${API_URL}/donations/history?bank_id=${bankId}` : `${API_URL}/donations/history`;
  const res = await axios.get(url);
  return res.data;
}