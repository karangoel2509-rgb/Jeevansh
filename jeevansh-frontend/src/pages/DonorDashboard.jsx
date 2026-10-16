import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDonorDashboard } from '../services/donorService';
import {
  HeartIcon,
  UsersIcon,
  AlertIcon,
  CheckCircleIcon,
  ShieldIcon,
  SparkleIcon,
  ClipboardIcon,
  SendIcon,
  ArrowRightIcon,
} from '../components/common/Icons';

export default function DonorDashboard() {
  const { donor } = useAuth();
  const [data, setData] = useState(null);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    getDonorDashboard(donor?.id).then((d) => {
      setData(d);
      setAvailable(d.available ?? true);
    });
  }, [donor]);

  if (!data) {
    return (
      <div className="text-center py-20">
        <div className="w-12 h-12 border-4 border-blood-200 border-t-blood-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  const nextMilestone = [1, 3, 5, 10].find((n) => n > data.totalDonations) || 10;
  const progress = Math.min((data.totalDonations / nextMilestone) * 100, 100);

  return (
    <div className="space-y-6">
      {/* ═══════════════ WELCOME HERO ═══════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blood-600 via-blood-700 to-blood-800 text-white p-6 md:p-8 animate-fade-in-up">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 -right-10 w-72 h-72 bg-red-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Active Donor
            </div>
            <h1 className="text-2xl md:text-3xl font-black mb-1">
              Welcome back, {donor?.name} 👋
            </h1>
            <p className="text-red-100 text-sm md:text-base">
              Here's your impact and what's coming next.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3">
            <div className="text-right">
              <p className="text-xs text-red-100 font-medium">Availability</p>
              <p className="text-sm font-bold">{available ? 'Available' : 'Paused'}</p>
            </div>
            <button
              onClick={() => setAvailable(!available)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                available ? 'bg-emerald-500' : 'bg-gray-400'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                  available ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════ STAT CARDS ═══════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Donations',
            value: data.totalDonations,
            icon: <HeartIcon size={22} />,
            gradient: 'from-blood-500 to-blood-700',
            shadow: 'shadow-blood-500/30',
            delay: 100,
          },
          {
            label: 'Lives Impacted',
            value: data.livesImpacted,
            icon: <UsersIcon size={22} />,
            gradient: 'from-emerald-500 to-emerald-700',
            shadow: 'shadow-emerald-500/30',
            delay: 200,
          },
          {
            label: 'Next Eligible In',
            value: '28',
            suffix: 'days',
            icon: <AlertIcon size={22} />,
            gradient: 'from-amber-500 to-amber-700',
            shadow: 'shadow-amber-500/30',
            delay: 300,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl shadow-xl shadow-blood-100/60 border-2 border-blood-100 p-6 hover:-translate-y-1 transition-all animate-fade-in-up"
            style={{ animationDelay: `${stat.delay}ms` }}
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg ${stat.shadow} mb-4`}>
              {stat.icon}
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
            <p className="text-3xl md:text-4xl font-black text-gray-900">
              {stat.value}
              {stat.suffix && (
                <span className="text-lg font-bold text-gray-400 ml-1">{stat.suffix}</span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* ═══════════════ MILESTONE PROGRESS ═══════════════ */}
      <div className="bg-white rounded-3xl shadow-xl shadow-blood-100/60 border-2 border-blood-100 p-6 md:p-7 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <SparkleIcon size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Your Progress</h3>
              <p className="text-xs text-gray-500">Next badge at {nextMilestone} donations</p>
            </div>
          </div>
          <span className="text-xs font-bold text-blood-600 bg-blood-50 px-3 py-1 rounded-full">
            {data.totalDonations} / {nextMilestone}
          </span>
        </div>

        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blood-500 to-blood-700 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-3">
          {nextMilestone - data.totalDonations} more{' '}
          {nextMilestone - data.totalDonations === 1 ? 'donation' : 'donations'} to unlock your next badge 🎯
        </p>
      </div>

      {/* ═══════════════ BADGES ═══════════════ */}
      <div className="bg-white rounded-3xl shadow-xl shadow-blood-100/60 border-2 border-blood-100 p-6 md:p-7 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <SparkleIcon size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Badges Earned</h3>
            <p className="text-xs text-gray-500">Achievements from your donation journey</p>
          </div>
        </div>

        {data.badges?.length ? (
          <div className="flex flex-wrap gap-2">
            {data.badges.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 rounded-2xl text-sm font-bold border-2 border-amber-200 shadow-sm"
              >
                <SparkleIcon size={14} className="text-amber-500" />
                {b}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-50 mb-3">
              <SparkleIcon size={26} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">No badges yet</p>
            <p className="text-xs text-gray-400">Donate to earn your first badge!</p>
          </div>
        )}
      </div>

      {/* ═══════════════ RECENT ACTIVITY ═══════════════ */}
      <div className="bg-white rounded-3xl shadow-xl shadow-blood-100/60 border-2 border-blood-100 p-6 md:p-7 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <ClipboardIcon size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Recent Activity</h3>
            <p className="text-xs text-gray-500">Your donation timeline</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gray-100 rounded-full" />

          <div className="space-y-5">
            {[
              {
                text: 'Donated at City Hospital Blood Bank',
                date: '2 months ago',
                status: 'Completed',
                statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                iconBg: 'from-emerald-500 to-emerald-700',
                icon: <CheckCircleIcon size={16} />,
              },
              {
                text: 'Received emergency alert for B+ blood',
                date: '3 months ago',
                status: 'Responded',
                statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
                iconBg: 'from-blue-500 to-blue-700',
                icon: <AlertIcon size={16} />,
              },
              {
                text: 'Registered on Jeevansh',
                date: '6 months ago',
                status: 'Welcome',
                statusColor: 'bg-gray-50 text-gray-700 border-gray-200',
                iconBg: 'from-gray-500 to-gray-700',
                icon: <HeartIcon size={16} />,
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 relative z-10 w-10 h-10 rounded-full bg-gradient-to-br ${item.iconBg} flex items-center justify-center text-white shadow-md ring-4 ring-white`}
                >
                  {item.icon}
                </div>

                <div className="flex-1 min-w-0 flex items-center justify-between gap-3 pt-1">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900">{item.text}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.date}</p>
                  </div>
                  <span
                    className={`flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full border ${item.statusColor}`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════ CTA ═══════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blood-600 to-blood-700 p-6 md:p-7 text-white animate-fade-in-up" style={{ animationDelay: '700ms' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
              <SendIcon size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Ready to save another life?</h3>
              <p className="text-red-100 text-sm">Your next eligible donation is in 28 days</p>
            </div>
          </div>
          <a
            href="tel:1800JEEVAN"
            className="inline-flex items-center gap-2 bg-white text-blood-700 font-bold px-6 py-3 rounded-2xl hover:bg-red-50 transition-all shadow-lg hover:-translate-y-0.5"
          >
            View Nearby Requests
            <ArrowRightIcon size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}