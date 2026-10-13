import { mockDonors } from './mockData';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function registerDonor(data) {
  await delay(600);
  return { id: `donor-${Date.now()}`, ...data, totalDonations: 0, livesImpacted: 0, badges: [], available: true };
}

export async function loginDonor(phone) {
  await delay(500);
  const donor = mockDonors.find((d) => d.phone === phone) || mockDonors[0];
  return { token: 'mock-token-' + Date.now(), donor };
}

export async function getDonorDashboard(donorId) {
  await delay(400);
  return mockDonors[0];
}