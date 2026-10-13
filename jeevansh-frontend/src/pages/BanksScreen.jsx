import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequest } from '../context/RequestContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function BanksScreen() {
  const { activeRequest } = useRequest();
  const navigate = useNavigate();

  useEffect(() => {
    // If someone refreshes or lands here without a request, send them back
    if (!activeRequest) {
      navigate('/request');
    }
  }, [activeRequest, navigate]);

  if (!activeRequest || !activeRequest.banks) return null;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Blood Available Nearby!</h1>
        <p className="text-gray-500">
          We found blood banks with <strong className="text-blood-600">{activeRequest.bloodType}</strong> blood in stock.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {activeRequest.banks.map((bank) => (
          <Card key={bank.id} className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{bank.name}</h3>
                <p className="text-sm text-gray-500 mt-1">📍 {bank.distance} km away</p>
                <div className="mt-3 flex gap-2">
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {bank.unitsAvailable} units available
                  </span>
                </div>
              </div>
              <div className="text-3xl">🏥</div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1 text-sm py-2" 
                onClick={() => window.open(`https://maps.google.com/?q=${bank.name}`, '_blank')}
              >
                Get Directions
              </Button>
              <Button 
                className="flex-1 text-sm py-2" 
                onClick={() => alert('Reservation feature coming soon!')}
              >
                Reserve Unit
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
        <h3 className="font-bold text-amber-800 mb-2">Can't reach a blood bank?</h3>
        <p className="text-sm text-amber-700 mb-4">You can still alert nearby donors directly via WhatsApp.</p>
        <Button variant="primary" onClick={() => navigate('/request/alerting')}>
          🚨 Still Alert Donors
        </Button>
      </div>
    </div>
  );
}