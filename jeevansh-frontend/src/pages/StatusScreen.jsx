import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import { getRequestStatus, simulateAccept } from '../services/requestService';
import toast from 'react-hot-toast';

export default function StatusScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    const poll = async () => {
      try {
        const s = await getRequestStatus(id);
        setStatus(s);
        if (s.status === 'donor_found' || s.status === 'completed') return;
        setTimeout(poll, 5000);
      } catch (err) {
        console.error(err);
      }
    };
    poll();
  }, [id]);

  const handleSimulateAccept = async () => {
    setSimulating(true);
    try {
      const data = await simulateAccept(id);
      setQrData(data);
      localStorage.setItem('last_donation_token', data.token);
      toast.success('Donor accepted! QR code generated.');
      const s = await getRequestStatus(id);
      setStatus(s);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to simulate');
    } finally {
      setSimulating(false);
    }
  };

  const steps = ['searching', 'donor_found', 'confirmed', 'completed'];
  const currentIdx = steps.indexOf(status?.status || 'searching');

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Request {id.slice(-6)}</h2>
          <StatusBadge status={status?.status} />
        </div>
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                i <= currentIdx ? 'bg-blood-600 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {i <= currentIdx ? '✓' : i + 1}
              </div>
              <div>
                <p className={`font-semibold ${i <= currentIdx ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </p>
                {i === currentIdx && <p className="text-xs text-blood-600 font-medium">In progress...</p>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Simulate Accept Button (Demo Only) */}
      {status?.status === 'searching' && !qrData && (
        <Card className="bg-amber-50 border-amber-200">
          <h3 className="font-bold text-amber-800 mb-2">🎬 Demo Control</h3>
          <p className="text-sm text-amber-700 mb-4">
            Normally this happens via WhatsApp. Click below to simulate a donor accepting the request.
          </p>
          <Button
            onClick={handleSimulateAccept}
            disabled={simulating}
            className="w-full"
          >
            {simulating ? 'Simulating...' : '✅ Simulate Donor Accept'}
          </Button>
        </Card>
      )}

      {/* Show Accepted Donor + QR Code */}
      {qrData && (
        <Card className="bg-emerald-50 border-emerald-200">
          <h3 className="text-lg font-bold text-emerald-800 mb-4">🎉 Donor Confirmed!</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Donor Name</p>
              <p className="font-semibold">{qrData.donor.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Blood Type</p>
              <p className="font-semibold">{qrData.donor.blood_type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-semibold">{qrData.donor.phone}</p>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="bg-white rounded-2xl p-6 text-center">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Show this QR code at the blood bank
            </p>
            <img
              src={`data:image/png;base64,${qrData.qr_image_base64}`}
              alt="Donation QR Code"
              className="w-56 h-56 mx-auto rounded-xl border-4 border-gray-100"
            />
            <p className="text-xs text-gray-400 mt-3">
              Token expires in 24 hours
            </p>
          </div>

          <div className="mt-4 flex gap-3">
            <a href={`tel:${qrData.donor.phone}`} className="flex-1">
              <Button variant="secondary" className="w-full">📞 Call Donor</Button>
            </a>
            <Button
              className="flex-1"
              onClick={() => navigate(`/verify/${qrData.token}`)}
            >
              🏥 Open Verify Page
            </Button>
          </div>
        </Card>
      )}

      {status?.accepted_donor && !qrData && (
        <Card className="bg-emerald-50 border-emerald-200">
          <h3 className="text-lg font-bold text-emerald-800 mb-4">🎉 Donor Found!</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500">Name</p><p className="font-semibold">{status.accepted_donor.name}</p></div>
            <div><p className="text-xs text-gray-500">Phone</p><p className="font-semibold">{status.accepted_donor.phone}</p></div>
          </div>
        </Card>
      )}

      <Button variant="secondary" size="lg" onClick={() => navigate('/')}>
        Back to Home
      </Button>
    </div>
  );
}