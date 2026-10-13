const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function loginBank(bankId) {
  await delay(500);
  return { token: 'bank-token-' + Date.now(), bank: { id: bankId, name: 'City Hospital Blood Bank' } };
}

export async function verifyDonation(token) {
  await delay(700);
  return { success: true, donorName: 'Donor 42', bloodType: 'B+', requestId: 'REQ-123456' };
}