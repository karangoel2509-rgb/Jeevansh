import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequestStatus } from '../services/requestService';
import {
  HeartIcon,
  AlertIcon,
  CheckCircleIcon,
  PhoneIcon,
  ShieldIcon,
} from '../components/common/Icons';
import toast from 'react-hot-toast';

export default function StatusScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);

  // We moved the fetch logic into a separate function so we can reuse it for the manual refresh button
  const fetchStatus = async (isManual = false) => {
    try {
      const s = await getRequestStatus(id);
      setStatus(s);
      if (isManual) toast.success('Status refreshed');
      return s;
    } catch (err) {
      console.error("Polling error:", err);
      // If there's an error (e.g., backend restarting), we don't crash. We just return null.
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const poll = async () => {
      if (!isMounted) return;
      
      const s = await fetchStatus();
      
      // Stop polling ONLY if the status is truly updated to donor_found or completed
      if (s && (s.status === 'donor_found' || s.status === 'completed')) {
        return; 
      }
      
      // Keep polling every 5 seconds, even if the last request failed!
      if (isMounted) {
        setTimeout(poll, 5000);
      }
    };

    poll();

    // Cleanup function to stop polling if the user leaves the page
    return () => {
      isMounted = false;
    };
  }, [id]);

  const steps = [
    { key: 'searching', label: 'Searching Donors', icon: <AlertIcon size={20} /> },
    { key: 'donor_found', label: 'Donor Found', icon: <HeartIcon size={20} /> },
    { key: 'completed', label: 'Completed', icon: <CheckCircleIcon size={20} /> },
  ];
  const currentIdx = steps.findIndex((s) => s.key === (status?.status || 'searching'));
  const isCompleted = status?.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blood-100 via-blood-50 to-red-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-blood-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-red-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-2xl mx-auto py-12 px-6">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-blood-200 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase text-blood-700 mb-4">
            <span className="w-1.5 h-1.5 bg-blood-500 rounded-full animate-pulse" />
            Live Request Tracking
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Request Status</h1>
          <p className="text-sm text-gray-600 font-mono mb-4">
            ID: <span className="font-bold text-blood-700">#{id.slice(-8).toUpperCase()}</span>
          </p>
          
          {/* Manual Refresh Button */}
          <button 
            onClick={() => fetchStatus(true)}
            className="text-xs font-bold text-blood-600 hover:text-blood-800 underline bg-white px-4 py-2 rounded-full shadow-sm"
          >
            Refresh Status
          </button>
        </div>

        {/* Timeline */}
        <div className="relative bg-white rounded-3xl shadow-2xl shadow-blood-200/60 border-2 border-blood-100 p-8 mb-6 animate-fade-in-up animate-delay-100">
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-blood-500 via-blood-600 to-blood-700 rounded-full" />
          
          <div className="flex items-center justify-between mb-8 pt-2">
            <h2 className="text-lg font-bold text-gray-900">Progress</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
              isCompleted ? 'bg-emerald-100 text-emerald-700' : currentIdx === 1 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {steps[currentIdx]?.label || 'Searching'}
            </span>
          </div>

          <div className="relative">
            <div className="absolute top-6 left-6 right-6 h-1 bg-gray-100 rounded-full" />
            <div className="absolute top-6 left-6 h-1 bg-gradient-to-r from-blood-500 to-blood-700 rounded-full transition-all duration-700"
              style={{ width: `calc(${(currentIdx / (steps.length - 1)) * 100}% - ${currentIdx === 0 ? 0 : 12}px)` }} />

            <div className="relative flex justify-between">
              {steps.map((step, i) => {
                const isDone = i <= currentIdx;
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isDone ? 'bg-gradient-to-br from-blood-500 to-blood-700 text-white shadow-lg shadow-blood-600/40' : 'bg-white border-2 border-gray-200 text-gray-400'
                    } ${i === currentIdx && !isCompleted ? 'ring-4 ring-blood-200 animate-pulse' : ''}`}>
                      {isDone ? step.icon : <span className="text-sm font-bold">{i + 1}</span>}
                    </div>
                    <p className={`mt-3 text-xs font-bold text-center ${isDone ? 'text-blood-700' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Searching State */}
        {status?.status === 'searching' && (
          <div className="bg-white rounded-3xl shadow-lg border-2 border-dashed border-amber-300 p-6 mb-6 animate-fade-in-up animate-delay-200 text-center">
            <p className="text-amber-800 font-bold mb-2">Alerting donors nearby...</p>
            <p className="text-xs text-amber-600">We will update this page automatically when someone accepts.</p>
          </div>
        )}

        {/* Donor Found State (ONLY SHOWS CONTACT INFO) */}
        {status?.status === 'donor_found' && status.accepted_donor && (
          <div className="bg-white rounded-3xl shadow-xl shadow-emerald-200/60 border-2 border-emerald-200 p-8 animate-fade-in-up text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4 animate-float">
              <HeartIcon size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-emerald-800 mb-2">🎉 Donor Found!</h2>
            <p className="text-sm text-gray-500 mb-6">Please contact them to coordinate your arrival at the hospital.</p>
            
            <div className="bg-gray-50 rounded-2xl p-5 mb-6 max-w-sm mx-auto">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Donor Name</p>
              <p className="text-lg font-black text-gray-900 mb-4">{status.accepted_donor.name}</p>
              
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Blood Type</p>
              <p className="text-lg font-black text-blood-600 mb-4">{status.accepted_donor.blood_type}</p>
              
              <a href={`tel:${status.accepted_donor.phone}`} className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 transition flex items-center justify-center gap-2">
                <PhoneIcon size={20} />
                Call {status.accepted_donor.phone}
              </a>
            </div>
          </div>
        )}

        {/* Completed State */}
        {isCompleted && (
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl shadow-2xl p-8 animate-fade-in-up text-center text-white">
            <CheckCircleIcon size={48} className="mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">Donation Completed!</h2>
            <p className="text-emerald-50 mb-6">The hospital has verified the donation. Thank you for using Jeevansh.</p>
            <button onClick={() => navigate('/')} className="bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition">
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}