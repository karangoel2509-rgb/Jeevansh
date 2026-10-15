import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { verifyDonation } from '../services/bankService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function BankScan() {
  const { bank } = useAuth();
  const [scanned, setScanned] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  const processToken = async (token) => {
    try {
      const result = await verifyDonation(token, bank?.id);
      setScanned(result);
      toast.success('Donation verified!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Verification failed');
    }
  };

  const startScan = async () => {
    setScanning(true);
    const scanner = new Html5Qrcode(containerRef.current.id);
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          // If QR contains a URL like http://localhost:3000/verify/TOKEN, extract token
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

  const handleManualVerify = async () => {
    if (!manualToken.trim()) return toast.error('Please paste a token');
    await processToken(manualToken.trim());
  };

  // For demo: simulate by grabbing a token from the URL if provided
  const simulateScan = async () => {
    // Try to get the last created token from localStorage (we'll set it from status screen)
    const lastToken = localStorage.getItem('last_donation_token');
    if (!lastToken) {
      return toast.error('No recent token. Use the Status page to simulate first.');
    }
    await processToken(lastToken);
  };

  useEffect(() => () => { scannerRef.current?.stop().catch(() => {}); }, []);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Verify Donation</h1>
        <p className="text-gray-500 mt-1">Scan the donor's QR code or paste the token.</p>
      </div>

      {!scanned && (
        <>
          <Card>
            <div id="qr-reader" ref={containerRef} className="w-full rounded-xl overflow-hidden mb-4" />
            {!scanning && (
              <div className="space-y-3">
                <Button size="lg" onClick={startScan}>📷 Start Camera Scan</Button>
                <Button variant="secondary" size="lg" onClick={simulateScan}>
                  ⚡ Simulate Scan (Demo)
                </Button>
              </div>
            )}
            {scanning && (
              <p className="text-center text-sm text-gray-500 animate-pulse">Scanning...</p>
            )}
          </Card>

          <Card>
            <h3 className="font-bold mb-3">Manual Token Entry</h3>
            <textarea
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blood-500/20 focus:border-blood-500 outline-none font-mono text-xs"
              rows="4"
              placeholder="Paste the token here..."
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
            />
            <Button className="mt-3 w-full" onClick={handleManualVerify}>
              Verify Token
            </Button>
          </Card>
        </>
      )}

      {scanned && (
        <Card className="bg-emerald-50 border-emerald-200">
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">✅</span>
            </div>
            <h3 className="text-2xl font-bold text-emerald-800 mb-4">Donation Verified</h3>
            <div className="bg-white rounded-xl p-4 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">Donor</p><p className="font-semibold">{scanned.donor_name}</p></div>
                <div><p className="text-xs text-gray-500">Blood Type</p><p className="font-semibold">{scanned.blood_type}</p></div>
                <div><p className="text-xs text-gray-500">Request ID</p><p className="font-semibold text-xs">{scanned.request_id?.slice(-6)}</p></div>
                <div><p className="text-xs text-gray-500">Time</p><p className="font-semibold">{new Date().toLocaleTimeString()}</p></div>
              </div>
              <p className="text-sm text-emerald-700 mt-4 italic">{scanned.message}</p>
            </div>
            <Button onClick={() => setScanned(null)}>Scan Next Donor</Button>
          </div>
        </Card>
      )}
    </div>
  );
}