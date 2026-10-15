import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { verifyDonation } from '../services/bankService';

export default function VerifyScreen() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await verifyDonation(token, 'bank-1');
        setResult(res);
      } catch (err) {
        setError(err.response?.data?.detail || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="text-5xl mb-4 animate-pulse">⏳</div>
        <p className="text-gray-500">Verifying donation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <Card className="bg-red-50 border-red-200 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Verification Failed</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <Card className="bg-emerald-50 border-emerald-200 text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-6xl">✅</span>
        </div>
        <h2 className="text-3xl font-bold text-emerald-800 mb-2">Donation Verified!</h2>
        <p className="text-emerald-700 mb-6">{result.message}</p>

        <div className="bg-white rounded-xl p-5 text-left mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Donor</p>
              <p className="font-semibold">{result.donor_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Blood Type</p>
              <p className="font-semibold">{result.blood_type}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500">Request</p>
              <p className="font-mono text-xs">{result.request_id}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500">Verified At</p>
              <p className="font-semibold">{new Date(result.verified_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-emerald-600 italic mb-6">
          Every drop counts. Thank you for saving a life. ❤️
        </p>

        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </Card>
    </div>
  );
}