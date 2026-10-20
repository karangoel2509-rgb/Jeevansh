import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDonorDashboard, getPendingRequests, acceptRequest, rejectRequest, getCertificates } from '../services/donorService';
import {
  HeartIcon,
  AlertIcon,
  CheckCircleIcon,
  LocationIcon,
  ShieldIcon,
  ClipboardIcon,
} from '../components/common/Icons';
import toast from 'react-hot-toast';

export default function DonorDashboard() {
  const { donor } = useAuth();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [activeQr, setActiveQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    if (!donor?.id) return;
    try {
      const [s, p, c] = await Promise.all([
        getDonorDashboard(donor.id),
        getPendingRequests(donor.id),
        getCertificates(donor.id)
      ]);
      setStats(s);
      setPending(p);
      setCertificates(c);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [donor]);

  const handleAccept = async (requestId) => {
    try {
      const res = await acceptRequest(donor.id, requestId);
      setActiveQr(res); // Show the QR code
      setPending(pending.filter(p => p.id !== requestId)); // Remove from pending list
      localStorage.setItem('last_donation_token', res.token);
      toast.success('You have accepted the request!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to accept');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await rejectRequest(donor.id, requestId);
      setPending(pending.filter(p => p.id !== requestId)); // Remove from UI
      toast.success('Request declined');
    } catch (err) {
      toast.error('Failed to decline request');
    }
  };

  const handleCopyToken = () => {
    if (!activeQr?.token) return;
    navigator.clipboard.writeText(activeQr.token);
    setCopied(true);
    toast.success('Token copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !stats) return <div className="text-center py-20 animate-pulse text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      
      {/* 1. WELCOME HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blood-600 via-blood-700 to-blood-800 text-white p-6 md:p-8 animate-fade-in-up">
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black mb-1">Welcome back, {donor?.name} 👋</h1>
            <p className="text-red-100 text-sm">Here is your impact and active requests.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 rounded-2xl px-5 py-3 text-center">
              <p className="text-2xl font-black">{stats.totalDonations}</p>
              <p className="text-xs text-red-100 font-medium">Donations</p>
            </div>
            <div className="bg-white/10 rounded-2xl px-5 py-3 text-center">
              <p className="text-2xl font-black">{stats.livesImpacted}</p>
              <p className="text-xs text-red-100 font-medium">Lives Impacted</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE QR CODE (With Manual Token Fallback) */}
      {activeQr && (
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-blood-200 p-6 md:p-8 animate-fade-in-up text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blood-100 mb-4 animate-float">
            <CheckCircleIcon size={32} className="text-blood-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">You're a Hero! 🎉</h2>
          <p className="text-sm text-gray-500 mb-6">Show this QR code to the blood bank officer to verify your donation.</p>
          
          <div className="bg-gray-50 rounded-2xl p-4 max-w-xs mx-auto mb-6 border border-gray-200">
            <img src={`data:image/png;base64,${activeQr.qr_image_base64}`} alt="QR Code" className="w-full rounded-xl" />
          </div>

          {/* NEW: Manual Token Fallback */}
          <div className="max-w-xs mx-auto mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-left">
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1">
              <ClipboardIcon size={14} /> Backup Token
            </p>
            <p className="text-[11px] text-blue-700 mb-3 leading-tight">
              If the bank's scanner fails, give them this code to paste manually.
            </p>
            <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg p-2">
              <span className="text-[10px] text-gray-500 font-mono truncate flex-1">
                {activeQr.token}
              </span>
              <button 
                onClick={handleCopyToken}
                className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-md hover:bg-blue-700 transition"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          
          <button onClick={() => setActiveQr(null)} className="text-sm font-bold text-gray-500 hover:text-gray-800 underline">
            I have reached the blood bank
          </button>
        </div>
      )}

      {/* 3. PENDING REQUESTS */}
      {pending.length > 0 && !activeQr && (
        <div className="bg-white rounded-3xl shadow-xl border-2 border-blood-100 p-6 animate-fade-in-up animate-delay-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertIcon size={20} className="text-amber-600 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Urgent Requests Near You</h3>
              <p className="text-xs text-gray-500">Patients need your blood type</p>
            </div>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {pending.map((req) => (
              <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <p className="font-black text-gray-900">{req.blood_type} needed</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <LocationIcon size={12} /> {req.hospital_name}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReject(req.id)}
                    className="bg-white border-2 border-gray-200 text-gray-600 text-sm font-bold px-4 py-2 rounded-xl hover:bg-gray-100 transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="bg-blood-600 text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-blood-700 transition shadow-md shadow-blood-600/20"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CERTIFICATES */}
      <div className="bg-white rounded-3xl shadow-xl border-2 border-blood-100 p-6 animate-fade-in-up animate-delay-200">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <ShieldIcon size={20} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">My Certificates</h3>
            <p className="text-xs text-gray-500">Proof of your life-saving donations</p>
          </div>
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
            <p className="text-sm text-gray-500 font-medium">No certificates yet.</p>
            <p className="text-xs text-gray-400 mt-1">Accept a request to earn your first one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {certificates.map((cert) => (
              <Link 
                to={`/donor/certificate/${cert.id}`} 
                key={cert.id} 
                className="flex items-center justify-between p-4 border border-emerald-100 bg-emerald-50 rounded-2xl hover:bg-emerald-100 hover:shadow-md transition-all cursor-pointer block"
              >
                <div>
                  <p className="font-bold text-emerald-900 text-sm">Certificate of Life</p>
                  <p className="text-xs text-emerald-700 mt-1">Verified on {new Date(cert.verified_at).toLocaleDateString()}</p>
                </div>
                <span className="bg-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                  {cert.blood_type}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}