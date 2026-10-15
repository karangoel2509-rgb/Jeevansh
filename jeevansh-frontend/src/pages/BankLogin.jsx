import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { loginBank } from '../services/bankService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function BankLogin() {
  const navigate = useNavigate();
  const { loginBank: setAuth } = useAuth();
  const [bankId, setBankId] = useState('bank-1');
  const [password, setPassword] = useState('city123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginBank(bankId, password);
      setAuth(data);
      toast.success(`Welcome, ${data.bank.name}`);
      navigate('/bank/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">🏥</div>
        <h1 className="text-3xl font-bold text-gray-900">Blood Bank Login</h1>
        <p className="text-gray-500 mt-2">Officer access to verify donations</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <Input
          label="Bank ID"
          placeholder="e.g. bank-1"
          value={bankId}
          onChange={(e) => setBankId(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? 'Logging in...' : 'Login to Dashboard'}
        </Button>

        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-600">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <p>bank-1 / city123</p>
          <p>bank-2 / redcross123</p>
          <p>bank-3 / govt123</p>
        </div>
      </form>
    </div>
  );
}