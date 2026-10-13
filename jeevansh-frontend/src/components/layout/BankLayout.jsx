import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function BankLayout() {
  const { bank, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blood-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/bank/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            <span className="text-xl font-bold">{bank?.name || 'Blood Bank Portal'}</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm bg-white/20 px-3 py-1 rounded-lg">Officer Dashboard</span>
            <button onClick={() => { logout(); navigate('/'); }} className="text-sm font-medium bg-white text-blood-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8"><Outlet /></main>
    </div>
  );
}