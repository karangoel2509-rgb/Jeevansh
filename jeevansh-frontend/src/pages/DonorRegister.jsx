import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BLOOD_GROUPS } from '../utils/bloodCompat';
import { registerDonor } from '../services/donorService';
import {
  HeartIcon,
  UsersIcon,
  PhoneIcon,
  LocationIcon,
  ShieldIcon,
  CheckCircleIcon,
  SparkleIcon,
  ArrowRightIcon,
} from '../components/common/Icons';
import toast from 'react-hot-toast';

export default function DonorRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    bloodType: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.bloodType) {
      return toast.error('Please fill all required fields');
    }
    setLoading(true);
    try {
      await registerDonor(form);
      toast.success('Registered! You will receive a WhatsApp confirmation.');
      navigate('/donor/login');
    } catch (err) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blood-100 via-blood-50 to-red-100 relative overflow-hidden">
      {/* Floating background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-blood-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-red-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blood-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-3xl mx-auto py-16 px-6">
        {/* ═══════════════ FORM CARD ═══════════════ */}
        <form
          onSubmit={handleSubmit}
          className="relative bg-white rounded-3xl shadow-2xl shadow-blood-200/60 border-2 border-blood-100 p-8 md:p-10 animate-fade-in-up"
        >
          {/* Gradient top accent */}
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-blood-500 via-blood-600 to-blood-700 rounded-full" />

          {/* ═══════════════ CARD HEADER ═══════════════ */}
          <div className="text-center mb-8 pt-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blood-500 to-blood-700 shadow-lg shadow-blood-600/30 mb-4 animate-float">
              <HeartIcon size={26} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 leading-tight">
              Become a <span className="text-blood-600">Donor</span>
            </h1>
            <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto leading-relaxed">
              Join 12,000+ heroes who save lives every day. Registration takes less than 30 seconds.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-blood-100 mb-8" />

          {/* ─── Full Name ─── */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3">
              <UsersIcon size={18} className="text-blood-600" />
              Full Name
              <span className="text-blood-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Ravi Kumar"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-5 py-4 text-base bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-blood-500/10 focus:border-blood-500 focus:bg-white outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* ─── Phone ─── */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3">
              <PhoneIcon size={18} className="text-blood-600" />
              WhatsApp Number
              <span className="text-blood-600">*</span>
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-5 py-4 text-base bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-blood-500/10 focus:border-blood-500 focus:bg-white outline-none transition-all placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-500 mt-2">
              We'll send emergency alerts to this number
            </p>
          </div>

          {/* ─── Blood Type ─── */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3">
              <HeartIcon size={18} className="text-blood-600" />
              Blood Type
              <span className="text-blood-600">*</span>
            </label>
            <div className="grid grid-cols-4 gap-3">
              {BLOOD_GROUPS.map((bg) => {
                const selected = form.bloodType === bg;
                return (
                  <button
                    type="button"
                    key={bg}
                    onClick={() => setForm({ ...form, bloodType: bg })}
                    className={`relative py-4 rounded-2xl font-black text-lg transition-all duration-200 ${
                      selected
                        ? 'bg-gradient-to-br from-blood-600 to-blood-700 text-white shadow-lg shadow-blood-600/40 scale-[1.05]'
                        : 'bg-gray-50 text-gray-700 border-2 border-gray-100 hover:border-blood-300 hover:bg-blood-50/50 hover:-translate-y-0.5'
                    }`}
                  >
                    {bg}
                    {selected && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow">
                        <CheckCircleIcon size={16} className="text-emerald-500" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Location ─── */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3">
              <LocationIcon size={18} className="text-blood-600" />
              Your Location
            </label>
            <input
              type="text"
              placeholder="Enter your city or area"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-5 py-4 text-base bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-blood-500/10 focus:border-blood-500 focus:bg-white outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* ─── Submit ─── */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blood-600 to-blood-700 text-white font-black text-lg py-5 rounded-2xl hover:shadow-2xl hover:shadow-blood-600/40 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3 animate-pulse-glow"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <HeartIcon size={22} />
                Register as Donor
              </>
            )}
          </button>

          {/* ─── Trust badges ─── */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <ShieldIcon size={14} className="text-emerald-500" />
              Secure & Private
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircleIcon size={14} className="text-emerald-500" />
              Verified Network
            </span>
            <span className="flex items-center gap-1.5">
              <SparkleIcon size={14} className="text-emerald-500" />
              Zero Spam
            </span>
          </div>
        </form>

        {/* ═══════════════ LOGIN LINK ═══════════════ */}
        <p className="text-center text-sm text-gray-600 mt-8 animate-fade-in-up animate-delay-200 font-medium">
          Already registered?{' '}
          <Link
            to="/donor/login"
            className="inline-flex items-center gap-1 text-blood-600 font-bold hover:text-blood-700 hover:underline transition"
          >
            Login here
            <ArrowRightIcon size={14} />
          </Link>
        </p>
      </div>
    </div>
  );
}