import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyDonation } from '../services/bankService';
import {
  HeartIcon,
  ShieldIcon,
  CheckCircleIcon,
  AlertIcon,
  UsersIcon,
  ClipboardIcon,
  SparkleIcon,
  ArrowRightIcon,
  PhoneIcon,
  SendIcon,
} from '../components/common/Icons';

export default function VerifyScreen() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

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

  const handleShare = async () => {
    const shareText = result
      ? `I just helped save a life through Jeevansh! Donor ${result.donor_name} (${result.blood_type}) successfully donated. 🩸❤️`
      : 'Check out Jeevansh — connecting blood donors to patients in seconds.';
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Jeevansh Donation Verified', text: shareText, url: shareUrl });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ═══════════════ LOADING STATE ═══════════════
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blood-100 via-blood-50 to-red-100 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-blood-200/40 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-red-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative text-center animate-fade-in">
          <div className="w-24 h-24 border-4 border-blood-200 border-t-blood-600 rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Verifying Donation</h2>
          <p className="text-sm text-gray-600">Please wait while we validate the token...</p>
        </div>
      </div>
    );
  }

  // ═══════════════ ERROR STATE ═══════════════
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blood-100 via-blood-50 to-red-100 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-red-200/40 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-blood-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-md mx-auto py-20 px-6">
          <div className="bg-white rounded-3xl shadow-2xl shadow-red-200/60 border-2 border-red-200 p-8 text-center animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6 animate-float">
              <AlertIcon size={48} className="text-red-600" />
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-red-700 mb-3">
              Verification Failed
            </h2>
            <p className="text-sm text-gray-600 mb-8 max-w-xs mx-auto leading-relaxed">
              {error}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-blood-600 to-blood-700 text-white font-black py-4 rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <HeartIcon size={20} />
                Back to Home
              </button>
              <button
                onClick={() => navigate('/request')}
                className="w-full bg-white border-2 border-blood-200 text-blood-700 font-bold py-4 rounded-2xl hover:bg-blood-50 transition-all flex items-center justify-center gap-2"
              >
                Report a Request
                <ArrowRightIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════ SUCCESS STATE ═══════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-blood-100 via-blood-50 to-red-100 relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-blood-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-red-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-xl mx-auto py-12 px-6">
        {/* ═══════════════ CELEBRATION HERO ═══════════════ */}
        <div className="text-center mb-8 animate-fade-in-up">
          {/* Confetti-style sparkles */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <span className="absolute w-32 h-32 rounded-full bg-emerald-300/40 animate-ping" style={{ animationDuration: '2.5s' }} />
            <span className="absolute w-24 h-24 rounded-full bg-emerald-400/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />

            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-2xl shadow-emerald-600/50 flex items-center justify-center animate-float">
              <CheckCircleIcon size={52} className="text-white" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border-2 border-emerald-200 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase text-emerald-700 mb-4">
            <SparkleIcon size={14} className="text-emerald-500" />
            Official Verification
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">
            Donation <span className="text-emerald-600">Verified!</span>
          </h1>
          <p className="text-base text-gray-600 max-w-md mx-auto leading-relaxed">
            {result.message || 'Thank you for saving a life.'}
          </p>
        </div>

        {/* ═══════════════ CERTIFICATE CARD ═══════════════ */}
        <div className="relative bg-white rounded-3xl shadow-2xl shadow-emerald-200/60 border-2 border-emerald-200 p-8 mb-6 animate-fade-in-up animate-delay-100">
          {/* Gradient top accent */}
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-full" />

          {/* Certificate header */}
          <div className="text-center pt-4 mb-6 pb-6 border-b-2 border-dashed border-emerald-100">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blood-500 to-blood-700 shadow-lg shadow-blood-600/30 mb-4">
              <HeartIcon size={26} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-1">
              Certificate of Life
            </h2>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Verified Donation • Jeevansh
            </p>
          </div>

          {/* Donor detail grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <UsersIcon size={14} className="text-emerald-600" />
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Donor</p>
              </div>
              <p className="font-black text-gray-900 text-base truncate">
                {result.donor_name}
              </p>
            </div>

            <div className="bg-blood-50 border border-blood-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <HeartIcon size={14} className="text-blood-600" />
                <p className="text-[10px] font-bold text-blood-700 uppercase tracking-wider">Blood Type</p>
              </div>
              <p className="font-black text-gray-900 text-base">
                {result.blood_type}
              </p>
            </div>

            <div className="col-span-2 bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <ClipboardIcon size={14} className="text-gray-600" />
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Request ID</p>
              </div>
              <p className="font-mono text-xs font-bold text-gray-900 break-all">
                {result.request_id}
              </p>
            </div>

            <div className="col-span-2 bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <ShieldIcon size={14} className="text-amber-600" />
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Verified At</p>
              </div>
              <p className="font-bold text-gray-900 text-sm">
                {new Date(result.verified_at).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          </div>

          {/* Signature footer */}
          <div className="pt-4 border-t border-dashed border-emerald-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                Verified by
              </p>
              <p className="text-xs font-bold text-gray-800">Jeevansh Network</p>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
              <CheckCircleIcon size={14} className="text-emerald-600" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                Authentic
              </span>
            </div>
          </div>
        </div>

        {/* ═══════════════ IMPACT MESSAGE ═══════════════ */}
        <div className="relative bg-gradient-to-br from-blood-600 via-blood-700 to-blood-800 rounded-3xl shadow-xl shadow-blood-900/30 p-6 mb-6 text-white overflow-hidden animate-fade-in-up animate-delay-200">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 mb-3 animate-float">
              <HeartIcon size={22} className="text-white" />
            </div>
            <p className="text-lg md:text-xl font-black mb-1">
              Every drop counts. ❤️
            </p>
            <p className="text-red-100 text-sm">
              This donation could save up to <span className="font-black">3 lives</span>.
            </p>
          </div>
        </div>

        {/* ═══════════════ ACTIONS ═══════════════ */}
        <div className="space-y-3 animate-fade-in-up animate-delay-300">
          <button
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-black text-lg py-5 rounded-2xl hover:shadow-2xl hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 animate-pulse-glow"
          >
            {copied ? (
              <>
                <CheckCircleIcon size={22} />
                Link Copied!
              </>
            ) : (
              <>
                <SendIcon size={22} />
                Share This Milestone
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <a
              href="tel:1800JEEVAN"
              className="flex items-center justify-center gap-2 bg-white border-2 border-blood-200 text-blood-700 font-bold py-4 rounded-2xl hover:bg-blood-50 transition-all"
            >
              <PhoneIcon size={18} />
              Contact
            </a>
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 bg-white border-2 border-blood-200 text-blood-700 font-bold py-4 rounded-2xl hover:bg-blood-50 transition-all"
            >
              Back to Home
              <ArrowRightIcon size={18} />
            </button>
          </div>
        </div>

        {/* ═══════════════ TRUST BADGES ═══════════════ */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-gray-600 animate-fade-in-up animate-delay-400">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldIcon size={14} className="text-emerald-500" />
            AES-256 Encrypted
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircleIcon size={14} className="text-emerald-500" />
            Audited
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <PhoneIcon size={14} className="text-emerald-500" />
            24/7 Support
          </span>
        </div>
      </div>
    </div>
  );
}