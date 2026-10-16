import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { verifyDonation } from '../services/bankService';
import { useAuth } from '../context/AuthContext';
import {
  ShieldIcon,
  CheckCircleIcon,
  AlertIcon,
  ClipboardIcon,
  HeartIcon,
  SparkleIcon,
  ArrowRightIcon,
  UsersIcon,
  PhoneIcon,
} from '../components/common/Icons';
import toast from 'react-hot-toast';

export default function BankScan() {
  const { bank } = useAuth();
  const navigate = useNavigate();
  const [scanned, setScanned] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  const processToken = async (token) => {
    setProcessing(true);
    setError(null);
    try {
      const result = await verifyDonation(token, bank?.id);
      setScanned(result);
      toast.success('Donation verified!');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Verification failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const startScan = async () => {
    setScanning(true);
    setError(null);
    const scanner = new Html5Qrcode(containerRef.current.id);
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          let token = decodedText;
          if (decodedText.includes('/verify/')) {
            token = decodedText.split('/verify/')[1];
          }
          await processToken(token);
        },
        () => {}
      );
    } catch (err) {
      toast.error('Camera access denied');
      setScanning(false);
    }
  };

  const simulateScan = async () => {
    const lastToken = localStorage.getItem('last_donation_token');
    if (!lastToken) {
      return toast.error('No recent token. Use the Status page first.');
    }
    await processToken(lastToken);
  };

  const handleManualVerify = async () => {
    if (!manualToken.trim()) return toast.error('Please paste a token');
    await processToken(manualToken.trim());
  };

  const reset = () => {
    setScanned(null);
    setError(null);
    setManualToken('');
  };

  useEffect(() => () => { scannerRef.current?.stop().catch(() => {}); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blood-100 via-blood-50 to-red-100 relative overflow-hidden -m-6 p-6">
      {/* Floating blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-blood-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-red-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-2xl mx-auto py-6">
        {/* ═══════════════ HEADER ═══════════════ */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blood-500 to-blood-700 shadow-lg shadow-blood-600/30 mb-4 animate-float">
            <ClipboardIcon size={28} className="text-white" />
          </div>
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-blood-200 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase text-blood-700 mb-3">
            <span className="w-1.5 h-1.5 bg-blood-500 rounded-full animate-pulse" />
            Secure Verification
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            Verify <span className="text-blood-600">Donation</span>
          </h1>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Scan the donor's QR code or paste the token manually.
          </p>
        </div>

        {/* ═══════════════ PROCESSING STATE ═══════════════ */}
        {processing && (
          <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-blood-100 p-10 text-center animate-fade-in-up">
            <div className="w-20 h-20 border-4 border-blood-200 border-t-blood-600 rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-1">Verifying...</h3>
            <p className="text-sm text-gray-500">Checking token validity and updating records</p>
          </div>
        )}

        {/* ═══════════════ SUCCESS STATE ═══════════════ */}
        {!processing && scanned && (
          <div className="animate-fade-in-up">
            {/* Celebration card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-3xl shadow-2xl shadow-emerald-900/30 p-8 mb-6 text-white">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-0 -right-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
              </div>

              <div className="relative text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 mb-5 animate-float">
                  <CheckCircleIcon size={52} className="text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-2">
                  ✅ Donation Verified!
                </h2>
                <p className="text-emerald-50 text-sm max-w-sm mx-auto mb-6">
                  {scanned.message || 'Thank you for saving a life.'}
                </p>
              </div>
            </div>

            {/* Donor details card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-blood-100/60 border-2 border-blood-100 p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <UsersIcon size={14} className="text-emerald-600" />
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Donor</p>
                  </div>
                  <p className="font-black text-gray-900 text-lg">{scanned.donor_name}</p>
                </div>

                <div className="bg-blood-50 border border-blood-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <HeartIcon size={14} className="text-blood-600" />
                    <p className="text-xs font-bold text-blood-700 uppercase tracking-wider">Blood Type</p>
                  </div>
                  <p className="font-black text-gray-900 text-lg">{scanned.blood_type}</p>
                </div>

                <div className="col-span-2 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ClipboardIcon size={14} className="text-gray-600" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Request ID</p>
                  </div>
                  <p className="font-mono text-sm font-bold text-gray-900 break-all">
                    {scanned.request_id}
                  </p>
                </div>

                <div className="col-span-2 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldIcon size={14} className="text-amber-600" />
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Verified At</p>
                  </div>
                  <p className="font-bold text-gray-900">
                    {new Date().toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full bg-gradient-to-r from-blood-600 to-blood-700 text-white font-black text-lg py-5 rounded-2xl hover:shadow-2xl hover:shadow-blood-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 animate-pulse-glow"
              >
                <ClipboardIcon size={22} />
                Scan Next Donor
              </button>
              <button
                onClick={() => navigate('/bank/dashboard')}
                className="w-full bg-white border-2 border-blood-200 text-blood-700 font-bold py-4 rounded-2xl hover:bg-blood-50 transition-all flex items-center justify-center gap-2"
              >
                Back to Dashboard
                <ArrowRightIcon size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════ ERROR STATE ═══════════════ */}
        {!processing && !scanned && error && (
          <div className="animate-fade-in-up">
            <div className="relative bg-white rounded-3xl shadow-xl border-2 border-red-200 p-8 mb-6 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4 animate-float">
                <AlertIcon size={40} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-black text-red-700 mb-2">Verification Failed</h2>
              <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="flex-1 bg-gradient-to-r from-blood-600 to-blood-700 text-white font-bold py-4 rounded-2xl hover:shadow-lg transition-all"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/bank/dashboard')}
                  className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ SCANNING / IDLE STATE ═══════════════ */}
        {!processing && !scanned && !error && (
          <>
            {/* Scanner card */}
            <div className="relative bg-white rounded-3xl shadow-xl shadow-blood-100/60 border-2 border-blood-100 p-6 mb-6 animate-fade-in-up">
              <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-blood-500 via-blood-600 to-blood-700 rounded-full" />

              <div className="pt-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blood-500 to-blood-700 flex items-center justify-center shadow-lg shadow-blood-500/30">
                    <ClipboardIcon size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">QR Scanner</h3>
                    <p className="text-xs text-gray-500">Point the camera at the donor's QR code</p>
                  </div>
                </div>

                {/* QR Reader container */}
                <div
                  id="qr-reader"
                  ref={containerRef}
                  className={`w-full rounded-2xl overflow-hidden transition-all ${
                    scanning ? 'min-h-[280px] bg-gray-900' : 'min-h-[120px] bg-gray-50 border-2 border-dashed border-gray-200'
                  }`}
                />

                {!scanning && (
                  <div className="mt-4 space-y-3">
                    <button
                      onClick={startScan}
                      className="w-full bg-gradient-to-r from-blood-600 to-blood-700 text-white font-black text-lg py-4 rounded-2xl hover:shadow-2xl hover:shadow-blood-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 animate-pulse-glow"
                    >
                      <ClipboardIcon size={22} />
                      Start Camera Scan
                    </button>
                    <button
                      onClick={simulateScan}
                      className="w-full bg-white border-2 border-amber-200 text-amber-700 font-bold py-4 rounded-2xl hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
                    >
                      <SparkleIcon size={18} />
                      Simulate Scan (Demo Mode)
                    </button>
                  </div>
                )}

                {scanning && (
                  <div className="mt-4 p-4 bg-blood-50 border border-blood-200 rounded-2xl flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blood-500 animate-pulse flex-shrink-0" />
                    <p className="text-sm font-bold text-blood-700">
                      Scanning... point camera at QR code
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Manual token card */}
            <div className="relative bg-white rounded-3xl shadow-xl shadow-blood-100/60 border-2 border-blood-100 p-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-full" />

              <div className="pt-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <ShieldIcon size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Manual Token Entry</h3>
                    <p className="text-xs text-gray-500">Paste the token if scanning fails</p>
                  </div>
                </div>

                <textarea
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none font-mono text-xs transition-all"
                  rows="4"
                  placeholder="Paste the token here..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                />
                <button
                  onClick={handleManualVerify}
                  disabled={!manualToken.trim()}
                  className="mt-3 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-2xl hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  <ShieldIcon size={18} />
                  Verify Token
                </button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-gray-600 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldIcon size={14} className="text-emerald-500" />
                AES-256 Encrypted
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircleIcon size={14} className="text-emerald-500" />
                Audit Logged
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <PhoneIcon size={14} className="text-emerald-500" />
                24/7 Support
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}