import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequest } from '../context/RequestContext';
import { createRequest } from '../services/requestService';
import {
  HeartIcon,
  SendIcon,
  ShieldIcon,
  CheckCircleIcon,
  PhoneIcon,
  SparkleIcon,
  ArrowRightIcon,
  UsersIcon,
  AlertIcon,
} from '../components/common/Icons';

export default function AlertingScreen() {
  const { activeRequest, setActiveRequest } = useRequest();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    if (!activeRequest) {
      navigate('/request');
      return;
    }
    (async () => {
      const created = await createRequest(activeRequest);
      setRequest(created);
      setActiveRequest({ ...activeRequest, ...created });
    })();
  }, []);

  // Animate the "sending" dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((c) => (c + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blood-100 via-blood-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blood-200 border-t-blood-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Preparing your request...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blood-100 via-blood-50 to-red-100 relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-blood-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-red-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-2xl mx-auto py-16 px-6">
        {/* ═══════════════ HERO — Animated Radar ═══════════════ */}
        <div className="text-center mb-10 animate-fade-in-up">
          {/* Radar rings */}
          <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6">
            <span className="absolute inset-0 rounded-full bg-blood-200/60 animate-ping" style={{ animationDuration: '2.5s' }} />
            <span className="absolute inset-3 rounded-full bg-blood-300/50 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
            <span className="absolute inset-6 rounded-full bg-blood-100/70 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '1s' }} />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blood-500 to-blood-700 shadow-2xl shadow-blood-600/50 flex items-center justify-center animate-float">
              <SendIcon size={36} className="text-white" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-blood-200 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase text-blood-700 mb-4">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            Live Alert Active
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">
            Alerting Donors
            <span className="text-blood-600">{'.'.repeat(dotCount)}</span>
          </h1>
          <p className="text-base text-gray-600 max-w-md mx-auto leading-relaxed">
            We've sent WhatsApp alerts to{' '}
            <span className="font-bold text-blood-700">
              {request.alerted_donors} compatible donors
            </span>{' '}
            within 15 km of your location.
          </p>
        </div>

        {/* ═══════════════ IMPACT STATS ═══════════════ */}
        <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in-up animate-delay-100">
          <div className="bg-white rounded-2xl shadow-lg shadow-blood-100/60 border-2 border-blood-100 p-4 text-center hover:-translate-y-1 transition-all">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blood-100 mb-2">
              <UsersIcon size={20} className="text-blood-600" />
            </div>
            <p className="text-2xl font-black text-gray-900">{request.alerted_donors}</p>
            <p className="text-xs font-medium text-gray-500">Alerted</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg shadow-blood-100/60 border-2 border-blood-100 p-4 text-center hover:-translate-y-1 transition-all">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 mb-2">
              <HeartIcon size={20} className="text-blue-600" />
            </div>
            <p className="text-2xl font-black text-gray-900">{request.blood_type}</p>
            <p className="text-xs font-medium text-gray-500">Needed</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg shadow-blood-100/60 border-2 border-blood-100 p-4 text-center hover:-translate-y-1 transition-all">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 mb-2">
              <SparkleIcon size={20} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-gray-900">15</p>
            <p className="text-xs font-medium text-gray-500">km radius</p>
          </div>
        </div>

        {/* ═══════════════ PRIMARY CTA ═══════════════ */}
        <div className="w-full mb-6 animate-fade-in-up animate-delay-200">
          <button
            onClick={() => navigate(`/request/status/${request.id}`)}
            className="w-full bg-gradient-to-r from-blood-600 to-blood-700 text-white font-black text-lg py-5 rounded-2xl hover:shadow-2xl hover:shadow-blood-600/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 animate-pulse-glow"
          >
            Track Live Status
            <ArrowRightIcon size={22} />
          </button>
        </div>

        {/* ═══════════════ REQUEST INFO CARD ═══════════════ */}
        <div className="relative bg-white rounded-3xl shadow-xl shadow-blood-200/40 border-2 border-blood-100 p-6 mb-6 animate-fade-in-up animate-delay-300">
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-full" />

          <div className="flex items-start gap-4 pt-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30">
              <AlertIcon size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 mb-1">Request Received</h3>
              <p className="text-sm text-gray-500 mb-3">
                You will be notified the moment a donor accepts.
              </p>
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Request ID</p>
                <p className="font-mono text-xs font-bold text-gray-800 break-all">
                  {request.id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════ WHAT HAPPENS NEXT ═══════════════ */}
        <div className="relative bg-white rounded-3xl shadow-xl shadow-blood-200/40 border-2 border-blood-100 p-6 mb-6 animate-fade-in-up animate-delay-400">
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-blood-500 via-blood-600 to-blood-700 rounded-full" />

          <h3 className="font-bold text-gray-900 mb-4 pt-2">What happens next?</h3>
          <div className="space-y-3">
            {[
              { icon: <SendIcon size={18} />, text: 'Donors receive the alert on WhatsApp', color: 'bg-blood-100 text-blood-600' },
              { icon: <HeartIcon size={18} />, text: 'A compatible donor taps YES to accept', color: 'bg-blue-100 text-blue-600' },
              { icon: <CheckCircleIcon size={18} />, text: 'You get their contact info instantly', color: 'bg-emerald-100 text-emerald-600' },
              { icon: <ShieldIcon size={18} />, text: 'QR code verifies the donation at the bank', color: 'bg-amber-100 text-amber-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════ TRUST BADGES ═══════════════ */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-gray-600 animate-fade-in-up animate-delay-500">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldIcon size={14} className="text-emerald-500" />
            Secure Alerts
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircleIcon size={14} className="text-emerald-500" />
            Verified Donors
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