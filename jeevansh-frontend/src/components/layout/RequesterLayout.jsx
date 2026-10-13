import { Link, Outlet } from 'react-router-dom';

export default function RequesterLayout() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🩸</span>
            <span className="text-xl font-bold text-blood-700">Jeevansh</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-blood-600 transition">Home</Link>
            <Link to="/request" className="text-sm font-medium text-gray-600 hover:text-blood-600 transition">Find Blood</Link>
            <Link to="/donor/register" className="text-sm font-medium text-gray-600 hover:text-blood-600 transition">Become a Donor</Link>
            {/* NEW LINK ADDED HERE */}
            <Link to="/bank/login" className="text-sm font-medium text-gray-600 hover:text-blood-600 transition">Blood Bank Portal</Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* NEW BUTTON ADDED HERE */}
            <Link to="/bank/login" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-blood-600 transition">
              Bank Login
            </Link>
            <Link to="/donor/login" className="text-sm font-semibold bg-blood-600 text-white px-4 py-2 rounded-lg hover:bg-blood-700 transition">
              Donor Login
            </Link>
          </div>
        </div>
      </header>
      
      <main><Outlet /></main>
      
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">🩸 Jeevansh</h3>
            <p className="text-gray-400 text-sm">Connecting donors to patients in seconds. Every drop counts.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/request" className="hover:text-white">Find Blood</Link></li>
              <li><Link to="/donor/register" className="hover:text-white">Register as Donor</Link></li>
              <li><Link to="/bank/login" className="hover:text-white">Blood Bank Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>help@jeevansh.org</li>
              <li>+91 98765 43210</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Emergency</h4>
            <p className="text-2xl font-bold text-blood-400">1800-JEEVAN</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          © 2026 Jeevansh. Built for Viksit Bharat 2047.
        </div>
      </footer>
    </div>
  );
}