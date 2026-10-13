import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function BankDashboard() {
  const recentDonations = [
    { name: 'Rahul S.', blood: 'B+', time: '10:42 AM', status: 'Verified' },
    { name: 'Priya M.', blood: 'O+', time: '10:15 AM', status: 'Verified' },
    { name: 'Amit K.', blood: 'A+', time: '9:50 AM', status: 'Pending' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bank Dashboard</h1>
        <p className="text-gray-500 mt-1">City Hospital Blood Bank — Officer View</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blood-50 to-white border-blood-100">
          <p className="text-sm font-medium text-gray-500">Today's Donations</p>
          <p className="text-4xl font-extrabold text-blood-700 mt-2">3</p>
          <p className="text-xs text-gray-400 mt-1">2 verified, 1 pending</p>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <p className="text-sm font-medium text-gray-500">Active Requests</p>
          <p className="text-4xl font-extrabold text-blue-700 mt-2">7</p>
          <p className="text-xs text-gray-400 mt-1">3 high priority</p>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <p className="text-sm font-medium text-gray-500">Blood Stock</p>
          <p className="text-4xl font-extrabold text-emerald-700 mt-2">142</p>
          <p className="text-xs text-gray-400 mt-1">units available</p>
        </Card>
      </div>

      <Link to="/bank/scan">
        <Button size="lg" className="shadow-lg shadow-blood-600/20">
          📷 Scan QR Code to Verify Donation
        </Button>
      </Link>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-900">Today's Donations</h3>
          <span className="text-xs font-semibold bg-blood-100 text-blood-700 px-3 py-1 rounded-full">Live</span>
        </div>
        <div className="space-y-3">
          {recentDonations.map((d, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blood-100 rounded-full flex items-center justify-center font-bold text-blood-700 text-sm">
                  {d.blood}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{d.name}</p>
                  <p className="text-xs text-gray-400">{d.time}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                d.status === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {d.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-gray-900 mb-4">Blood Stock Levels</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { group: 'A+', units: 24, color: 'bg-emerald-500' },
            { group: 'B+', units: 18, color: 'bg-emerald-500' },
            { group: 'O+', units: 32, color: 'bg-emerald-500' },
            { group: 'AB+', units: 9, color: 'bg-amber-500' },
            { group: 'A-', units: 6, color: 'bg-red-500' },
            { group: 'B-', units: 11, color: 'bg-amber-500' },
            { group: 'O-', units: 4, color: 'bg-red-500' },
            { group: 'AB-', units: 2, color: 'bg-red-500' },
          ].map((s) => (
            <div key={s.group} className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-lg font-bold text-gray-800">{s.group}</p>
              <p className="text-sm text-gray-500">{s.units} units</p>
              <div className={`w-full h-1.5 rounded-full mt-2 ${s.color}`} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}