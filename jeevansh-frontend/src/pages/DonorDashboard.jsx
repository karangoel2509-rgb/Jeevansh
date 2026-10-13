import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
import { getDonorDashboard } from '../services/donorService';

export default function DonorDashboard() {
  const { donor } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => { getDonorDashboard(donor?.id).then(setData); }, [donor]);

  if (!data) return <div className="text-center py-20 text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {donor?.name} 👋</h1>
        <p className="text-gray-500 mt-1">Here's your donation summary and impact.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blood-50 to-white border-blood-100">
          <p className="text-sm font-medium text-gray-500">Total Donations</p>
          <p className="text-4xl font-extrabold text-blood-700 mt-2">{data.totalDonations}</p>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <p className="text-sm font-medium text-gray-500">Lives Impacted</p>
          <p className="text-4xl font-extrabold text-emerald-700 mt-2">{data.livesImpacted}</p>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
          <p className="text-sm font-medium text-gray-500">Next Eligible</p>
          <p className="text-4xl font-extrabold text-amber-700 mt-2">28 <span className="text-lg font-medium">days</span></p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-gray-900 mb-4">🏅 Badges Earned</h3>
          {data.badges?.length ? (
            <div className="flex flex-wrap gap-2">
              {data.badges.map((b) => (
                <span key={b} className="px-4 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 rounded-full text-sm font-semibold border border-amber-200">🏅 {b}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No badges yet. Donate to earn your first one!</p>
          )}
        </Card>

        <Card>
          <h3 className="font-bold text-gray-900 mb-4">⚡ Availability</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Available to donate</p>
              <p className="text-sm text-gray-400">Toggle to appear in search results</p>
            </div>
            <button className="relative w-16 h-9 bg-emerald-500 rounded-full transition-colors">
              <span className="absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-md transition-transform" />
            </button>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-bold text-gray-900 mb-4">📋 Recent Activity</h3>
        <div className="space-y-3">
          {[
            { text: 'Donated at City Hospital Blood Bank', date: '2 months ago', status: 'Completed', color: 'text-emerald-600 bg-emerald-50' },
            { text: 'Received emergency alert for B+ blood', date: '3 months ago', status: 'Responded', color: 'text-blue-600 bg-blue-50' },
            { text: 'Registered on Jeevansh', date: '6 months ago', status: 'Welcome', color: 'text-gray-600 bg-gray-50' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-medium text-gray-800 text-sm">{item.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${item.color}`}>{item.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}