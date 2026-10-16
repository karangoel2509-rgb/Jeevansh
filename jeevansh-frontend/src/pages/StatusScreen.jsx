import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequestStatus, simulateAccept } from '../services/requestService';
import {
  HeartIcon,
  AlertIcon,
  CheckCircleIcon,
  PhoneIcon,
  ShieldIcon,
  SparkleIcon,
  LocationIcon,
  UsersIcon,
  ArrowRightIcon,
  ClipboardIcon,
} from '../components/common/Icons';
import toast from 'react-hot-toast';

export default function StatusScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleCopyToken = () => {
    if (!qrData?.token) return;
    navigator.clipboard.writeText(qrData.token);
    setCopied(true);
    toast.success('Token copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    { key: 'searching', label: 'Searching Donors', icon: <AlertIcon size={20} /> },
    { key: 'donor_found', label: 'Donor Found', icon: <HeartIcon size={20} /> },
    { key: 'confirmed', label: 'Confirmed', icon: <ShieldIcon size={20} /> },
    { key: 'completed', label: 'Completed', icon: <CheckCircleIcon size={20} /> },
  ];
  const currentIdx = steps.findIndex((s) => s.key === (status?.status || 'searching'));
  const isCompleted = status?.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blood-100 via-blood-50 to-red-100 relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-blood-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-red-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-3xl mx-auto py-12 px-6">
        {/* ═══════════════ PAGE HEADER ═══════════════ */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-blood-200 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase text-blood-700 mb-4">
            <span className="w-1.5 h-1.5 bg-blood-500 rounded-full animate-pulse" />
            Live Request Tracking
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            Request Status
          </h1>
          <p className="text-sm text-gray-600 font-mono">
            ID: <span className="font-bold text-blood-700">#{id.slice(-8).toUpperCase()}</span>
          </p>
        </div>

        {/* ═══════════════ TIMELINE CARD ═══════════════ */}
        <div className="relative bg-white rounded-3xl shadow-2xl shadow-blood-200/60 border-2 border-blood-100 p-8 mb-6 animate-fade-in-up animate-delay-100">
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-blood-500 via-blood-600 to-blood-700 rounded-full" />

          {/* Status badge */}
          <div className="flex items-center justify-between mb-8 pt-2">
            <h2 className="text-lg font-bold text-gray-900">Progress</h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-700'
                  : currentIdx === 1
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {steps[currentIdx]?.label || 'Searching'}
            </span>
          </div>

          {/* Timeline — horizontal */}
          <div className="relative">
            {/* Connecting line (background) */}
            <div className="absolute top-6 left-6 right-6 h-1 bg-gray-100 rounded-full" />
            {/* Connecting line (filled) */}
            <div
              className="absolute top-6 left-6 h-1 bg-gradient-to-r from-blood-500 to-blood-700 rounded-full transition-all duration-700"
              style={{
                width: `calc(${(currentIdx / (steps.length - 1)) * 100}% - ${currentIdx === 0 ? 0 : 12}px)`,
              }}
            />

            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((step, i) => {
                const isDone = i <= currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div
                      className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isDone
                          ? 'bg-gradient-to-br from-blood-500 to-blood-700 text-white shadow-lg shadow-blood-600/40'
                          : 'bg-white border-2 border-gray-200 text-gray-400'
                      } ${isCurrent && !isCompleted ? 'ring-4 ring-blood-200 animate-pulse' : ''}`}
                    >
                      {isDone ? step.icon : <span className="text-sm font-bold">{i + 1}</span>}
                      {isCurrent && !isCompleted && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blood-400 animate-ping" />
                      )}
                    </div>
                    <p
                      className={`mt-3 text-xs font-bold text-center transition-colors ${
                        isDone ? 'text-blood-700' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Searching indicator */}
          {status?.status === 'searching' && (
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 animate-fade-in">
              <div className="relative flex-shrink-0">
                <span className="w-3 h-3 rounded-full bg-amber-500 block" />
                <span className="absolute inset-0 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">Alerting donors nearby...</p>
                <p className="text-xs text-amber-700">This usually takes 30 seconds to 2 minutes</p>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════ DEMO CONTROL ═══════════════ */}
        {status?.status === 'searching' && !qrData && (
          <div className="relative bg-white rounded-3xl shadow-lg border-2 border-dashed border-amber-300 p-6 mb-6 animate-fade-in-up animate-delay-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <SparkleIcon size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Demo Control</h3>
                <p className="text-xs text-gray-500">
                  In production, donors accept via WhatsApp. For the demo, click below.
                </p>
              </div>
            </div>
            <button
              onClick={handleSimulateAccept}
              disabled={simulating}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-4 rounded-2xl hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {simulating ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <HeartIcon size={20} />
                  Simulate Donor Accept
                </>
              )}
            </button>
          </div>
        )}

        {/* ═══════════════ QR CODE CARD (THE HERO MOMENT) ═══════════════ */}
        {qrData && (
          <div className="relative bg-gradient-to-br from-blood-600 via-blood-700 to-blood-800 rounded-3xl shadow-2xl shadow-blood-900/40 p-8 mb-6 animate-fade-in-up text-white">
            {/* Celebration sparkles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
              <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float" />
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-red-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 mb-4 animate-float">
                <CheckCircleIcon size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-black mb-2">🎉 Donor Found!</h2>
              <p className="text-red-100 mb-6">
                Show this QR code at the blood bank to verify the donation.
              </p>

              {/* Donor info chips */}
              <div className="grid grid-cols-2 gap-3 mb-6 max-w-md mx-auto">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 text-left">
                  <p className="text-xs text-red-100 mb-1">Donor</p>
                  <p className="font-bold text-sm truncate">{qrData.donor.name}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3 text-left">
                  <p className="text-xs text-red-100 mb-1">Blood Type</p>
                  <p className="font-bold text-sm">{qrData.donor.blood_type}</p>
                </div>
              </div>

              {/* QR CODE — the star */}
              <div className="bg-white rounded-3xl p-6 max-w-xs mx-auto shadow-2xl animate-fade-in-up animate-delay-200">
                <img
                  src={`data:image/png;base64,${qrData.qr_image_base64}`}
                  alt="Donation QR Code"
                  className="w-full aspect-square"
                />
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-medium">Token expires in 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ ACTION BUTTONS ═══════════════ */}
        {qrData && (
          <div className="space-y-3 animate-fade-in-up animate-delay-300">
            <button
              onClick={() => navigate(`/verify/${qrData.token}`)}
              className="w-full bg-gradient-to-r from-blood-600 to-blood-700 text-white font-black text-lg py-5 rounded-2xl hover:shadow-2xl hover:shadow-blood-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 animate-pulse-glow"
            >
              <ShieldIcon size={22} />
              Open Verify Page
            </button>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${qrData.donor.phone}`}
                className="flex items-center justify-center gap-2 bg-white border-2 border-blood-200 text-blood-700 font-bold py-4 rounded-2xl hover:bg-blood-50 transition-all"
              >
                <PhoneIcon size={18} />
                Call Donor
              </a>
              <button
                onClick={handleCopyToken}
                className="flex items-center justify-center gap-2 bg-white border-2 border-blood-200 text-blood-700 font-bold py-4 rounded-2xl hover:bg-blood-50 transition-all"
              >
                {copied ? (
                  <>
                    <CheckCircleIcon size={18} className="text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardIcon size={18} />
                    Copy Token
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════ COMPLETED STATE ═══════════════ */}
        {isCompleted && (
          <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 p-8 mt-6 animate-fade-in-up">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4 animate-float">
                <CheckCircleIcon size={40} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-emerald-700 mb-2">Donation Completed!</h2>
              <p className="text-gray-500 mb-6">Thank you for saving a life. ❤️</p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blood-600 to-blood-700 text-white font-bold px-8 py-4 rounded-2xl hover:shadow-lg transition-all"
              >
                Back to Home
                <ArrowRightIcon size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════ BACK BUTTON ═══════════════ */}
        {!isCompleted && !qrData && (
          <button
            onClick={() => navigate('/')}
            className="w-full text-center text-sm text-gray-500 hover:text-blood-600 font-medium mt-6 animate-fade-in-up animate-delay-300"
          >
            ← Back to Home
          </button>
        )}
      </div>
    </div>
  );
}