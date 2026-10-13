import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { loginDonor } from '../services/donorService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function DonorLogin() {
  const navigate = useNavigate();
  const { loginDonor: setAuth } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = await loginDonor(phone);
    setAuth(data);
    setLoading(false);
    toast.success('Welcome back!');
    navigate('/donor/dashboard');
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">🩸</div>
        <h1 className="text-3xl font-bold text-gray-900">Donor Login</h1>
        <p className="text-gray-500 mt-2">Enter your WhatsApp number to continue</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <Input label="WhatsApp Number" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Button type="submit" size="lg" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
      </form>
      <p className="text-center mt-6 text-sm text-gray-500">
        New donor? <Link to="/donor/register" className="text-blood-600 font-semibold hover:underline">Register here</Link>
      </p>
    </div>
  );
}