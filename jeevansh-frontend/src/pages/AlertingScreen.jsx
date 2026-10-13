import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequest } from '../context/RequestContext';
import { createRequest } from '../services/requestService';
import Button from '../components/common/Button';

export default function AlertingScreen() {
  const { activeRequest, setActiveRequest } = useRequest();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);

  useEffect(() => {
    if (!activeRequest) return navigate('/request');
    (async () => {
      const created = await createRequest(activeRequest);
      setRequest(created);
      setActiveRequest({ ...activeRequest, ...created });
    })();
  }, []);

  if (!request) return <div className="text-center py-20 text-gray-500">Preparing your request...</div>;

  return (
    <div className="max-w-lg mx-auto py-20 px-4 text-center">
      <div className="w-24 h-24 bg-blood-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
        <span className="text-5xl">📡</span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Alerting Donors</h2>
      <p className="text-gray-500 mb-8">
        We've sent WhatsApp alerts to <strong className="text-blood-600">{request.alertedDonors} compatible donors</strong> within 15 km of your location.
      </p>
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 mb-8">
        <p className="text-sm text-amber-800">Request ID: <strong>{request.id}</strong></p>
        <p className="text-sm text-amber-800 mt-1">You will be notified when a donor accepts.</p>
      </div>
      <Button size="lg" onClick={() => navigate(`/request/status/${request.id}`)}>
        Track Status →
      </Button>
    </div>
  );
}