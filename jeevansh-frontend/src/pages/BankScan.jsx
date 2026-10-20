import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { scanDonationQR, approveDonation, rejectDonation } from '../services/bankService';
import { useAuth } from '../context/AuthContext';
import {
  ShieldIcon,
  CheckCircleIcon,
  AlertIcon,
  ClipboardIcon,
  HeartIcon,
  SparkleIcon,
  ArrowRightIcon,
  PhoneIcon,
  UsersIcon,
} from '../components/common/Icons';
import toast from 'react-hot-toast';

export default function BankScan() {
  const { bank } = useAuth();
  const navigate = useNavigate();
  
  const [scannedData, setScannedData] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [manualToken, setManualToken] = useState('');
  const [currentToken, setCurrentToken] = useState('');
  
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  const handleScan = async (token) => {
    setProcessing(true);
    setError(null);
    try {
      const result = await scanDonationQR(token, bank?.id);
      setScannedData(result);
      setCurrentToken(token); // Save token for approve/reject
      localStorage.removeItem('last_donation_token');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid QR code';
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
          let token = decodedText.includes('/verify/') ? decodedText.split('/verify/')[1] : decodedText;
          await handleScan(token);
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
    if (!lastToken) return toast.error('No recent token. Use the Status page first.');
    await handleScan(lastToken);
  };

  const handleAction = async (action) => {
    if (!scannedData) return;
    setProcessing(true);
    try {
      if (action === 'approve') {
        await approveDonation(scannedData.request_id, currentToken, bank?.id);
        toast.success('Donation Approved!');
      } else {
        await rejectDonation(scannedData.request_id, currentToken, bank?.id);
        toast.success('Donation Rejected');
      }
      reset();
    } catch (err) {
      toast.error(err.response?.data?.detail || `Failed to ${action}`);
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setScannedData(null);
    setError(null);
    setManualToken('');
    setCurrentToken('');
  };

  useEffect(() => () => { scannerRef.current?.stop().catch(() => {}); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blood-100 via-blood-50 to-red-100 relative overflow-hidden -m-6 p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-blood-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-red-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-2xl mx-auto py-6">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blood-500 to-blood-700 shadow-lg shadow-blood-600/30 mb-4 animate-float">
            <ClipboardIcon size={28} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            Verify <span className="text-blood-600">Donation</span>
          </h1>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Scan the donor's QR code to begin medical screening.
          </p>
        </div>

        {processing && (
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-blood-100 p-10 text-center animate-fade-in-up">
            <div className="w-20 h-20 border-4 border-blood-200 border-t-blood-600 rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-1">Processing...</h3>
          </div>
        )}

        {/* SCANNED STATE - SHOW APPROVE/REJECT */}
        {!processing && scannedData && (
          <div className="animate-fade-in-up">
            <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-200 p-8 mb-6 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4 animate-float">
                <UsersIcon size={40} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Donor Arrived</h2>
              <p className="text-sm text-gray-500 mb-6">Please perform the medical eligibility test before proceeding.</p>
              
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-5 mb-6 text-left">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Donor Name</p>
                  <p className="font-black text-gray-900">{scannedData.donor_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Blood Type</p>
                  <p className="font-black text-blood-600">{scannedData.blood_type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAction('reject')}
                  className="w-full bg-white border-2 border-red-200 text-red-600 font-bold py-4 rounded-2xl hover:bg-red-50 transition-all"
                >
                  ❌ Reject Donor
                </button>
                <button
                  onClick={() => handleAction('approve')}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold py-4 rounded-2xl hover:shadow-lg transition-all"
                >
                  ✅ Approve Donation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {!processing && !scannedData && error && (
          <div className="bg-white rounded-3xl shadow-xl border-2 border-red-200 p-8 mb-6 text-center animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4 animate-float">
              <AlertIcon size={40} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-black text-red-700 mb-2">Verification Failed</h2>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <button onClick={reset} className="w-full bg-gradient-to-r from-blood-600 to-blood-700 text-white font-bold py-4 rounded-2xl">
              Try Again
            </button>
          </div>
        )}

        {/* SCANNING STATE */}
        {!processing && !scannedData && !error && (
          <>
            <div className="bg-white rounded-3xl shadow-xl border-2 border-blood-100 p-6 mb-6 animate-fade-in-up">
              <div className="pt-2">
                <div id="qr-reader" ref={containerRef} className={`w-full rounded-2xl overflow-hidden transition-all ${scanning ? 'min-h-[280px] bg-gray-900' : 'min-h-[120px] bg-gray-50 border-2 border-dashed border-gray-200'}`} />

                {!scanning && (
                  <div className="mt-4 space-y-3">
                    <button onClick={startScan} className="w-full bg-gradient-to-r from-blood-600 to-blood-700 text-white font-black text-lg py-4 rounded-2xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 animate-pulse-glow">
                      <ClipboardIcon size={22} /> Start Camera Scan
                    </button>
                    <button onClick={simulateScan} className="w-full bg-white border-2 border-amber-200 text-amber-700 font-bold py-4 rounded-2xl hover:bg-amber-50 transition-all flex items-center justify-center gap-2">
                      <SparkleIcon size={18} /> Simulate Scan (Demo Mode)
                    </button>
                  </div>
                )}

                {scanning && (
                  <div className="mt-4 p-4 bg-blood-50 border border-blood-200 rounded-2xl flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blood-500 animate-pulse" />
                    <p className="text-sm font-bold text-blood-700">Scanning... point camera at QR code</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 p-6 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <ShieldIcon size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Manual Token Entry</h3>
                </div>
              </div>
              <textarea
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-mono text-xs transition-all"
                rows="3"
                placeholder="Paste the token here..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
              />
              <button
                onClick={() => handleScan(manualToken.trim())}
                disabled={!manualToken.trim()}
                className="mt-3 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Verify Token
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}