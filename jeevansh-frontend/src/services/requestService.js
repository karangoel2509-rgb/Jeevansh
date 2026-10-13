import { mockDonors, mockBanks } from './mockData';
import { getCompatibleDonors } from '../utils/bloodCompat';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function checkBanks(bloodType) {
  await delay(500);
  return mockBanks.map((b) => ({
    ...b,
    hasStock: (b.stock[bloodType] || 0) > 0,
    unitsAvailable: b.stock[bloodType] || 0
  })).sort((a, b) => a.distance - b.distance);
}

export async function createRequest(data) {
  await delay(800);
  const compatible = getCompatibleDonors(data.bloodType);
  const matchedDonors = mockDonors
    .filter((d) => compatible.includes(d.bloodType) && d.available)
    .slice(0, 20);

  return {
    id: `REQ-${Date.now().toString().slice(-6)}`,
    ...data,
    status: 'searching',
    createdAt: new Date().toISOString(),
    alertedDonors: matchedDonors.length,
    matchedDonors
  };
}

export async function getRequestStatus(requestId) {
  await delay(300);
  const accepted = Math.random() < 0.3;
  return {
    id: requestId,
    status: accepted ? 'donor_found' : 'searching',
    acceptedDonor: accepted
      ? { name: 'Rahul Sharma', phone: '+919876543210', distance: 2.4 }
      : null
  };
}