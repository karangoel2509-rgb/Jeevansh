import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function loginBank(bankId, password) {
  const res = await axios.post(`${API_URL}/banks/login`, {
    bank_id: bankId,
    password: password,
  });
  return res.data; // { success, token, bank: {id, name} }
}

export async function verifyDonation(token, bankId = null) {
  const res = await axios.post(`${API_URL}/donations/verify`, {
    token: token,
    bank_id: bankId,
  });
  return res.data; // { success, message, donor_name, blood_type, ... }
}

export async function getDonationHistory(bankId) {
  const url = bankId
    ? `${API_URL}/donations/history?bank_id=${bankId}`
    : `${API_URL}/donations/history`;
  const res = await axios.get(url);
  return res.data;
}