import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Logo from '../common/Logo';
import { PhoneIcon, HeartIcon, UsersIcon, AlertIcon } from '../common/Icons';

export default function RequesterLayout() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLink = (path, label) => {
    const isActive = location.pathname === path;
    return (
      <Link
        to={path}
        className={`nav-underline text-[13px] font-bold tracking-widest uppercase transition-colors py-2 ${
          isActive ? 'text-blood-700 active' : 'text-gray-600 hover:text-blood-600'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ═══ Top gradient accent ═══ */}
      {/* <div className="h-[3px] bg-gradient-to-r from-blood-500 via-blood-700 to-blood-900" /> */}

      {/* ═══ Emergency ticker ═══ */}
      {/* <div className="bg-gray-900 text-white text-xs">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="font-medium tracking-wide">24/7 Emergency Blood Helpline — Live Network</span>
          </div>
          <a
            href="tel:1800JEEVAN"
            className="flex items-center gap-2 hover:text-blood-300 transition font-semibold"
          >
            <PhoneIcon size={12} />
            1800-JEEVAN
          </a>
        </div>
      </div> */}

      {/* ═══ Main Header ═══ */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-200/40 border-b border-gray-100'
            : 'bg-white border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center group">
            <Logo size={44} />
          </Link>

          <nav className="hidden lg:flex items-center gap-9">
            {navLink('/', 'Home')}
            {navLink('/request', 'Find Blood')}
            {navLink('/donor/register', 'Become a Donor')}
            {navLink('/bank/login', 'Blood Bank Portal')}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/donor/login"
              className="hidden md:inline-block text-sm font-bold text-gray-600 hover:text-blood-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/donor/register"
              className="inline-flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-blood-600 to-blood-700 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blood-600/30 hover:-translate-y-0.5 transition-all"
            >
              <HeartIcon size={16} />
              Donate Now
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* ═══ Footer ═══ */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Logo size={38} textColor="text-white" />
            <p className="text-gray-400 text-sm mt-4 leading-relaxed">
              Connecting donors to patients in seconds. Every drop counts.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              All systems operational
            </div>
          </div>

          <div>
            <h4 className="font-bold text-base mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link to="/request" className="hover:text-white transition flex items-center gap-2">
                  <HeartIcon size={14} />
                  Find Blood
                </Link>
              </li>
              <li>
                <Link to="/donor/register" className="hover:text-white transition flex items-center gap-2">
                  <UsersIcon size={14} />
                  Become a Donor
                </Link>
              </li>
              <li>
                <Link to="/bank/login" className="hover:text-white transition flex items-center gap-2">
                  <AlertIcon size={14} />
                  Blood Bank Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-base mb-4 text-white">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>help@jeevansh.org</li>
              <li>+91 98765 43210</li>
              <li className="pt-2 text-xs text-gray-500">
                Available 24/7 for emergencies
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-base mb-4 text-white">Emergency Helpline</h4>
            <p className="text-3xl font-black text-blood-400 tracking-tight">1800-JEEVAN</p>
            <p className="text-xs text-gray-500 mt-2">Free • 24/7 • Pan-India</p>
          </div>
        </div>

        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-500">
            <p>© 2026 Jeevansh. Built for Viksit Bharat 2047.</p>
            <p className="flex items-center gap-4">
              <span className="hover:text-gray-300 cursor-pointer transition">Privacy</span>
              <span className="hover:text-gray-300 cursor-pointer transition">Terms</span>
              <span className="hover:text-gray-300 cursor-pointer transition">Support</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}