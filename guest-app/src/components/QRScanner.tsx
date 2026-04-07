'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [scannedRoom, setScannedRoom] = useState('');
  const router = useRouter();
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerInitialized = useRef(false);

  const extractRoomFromUrl = (url: string): string | null => {
    try {
      // Try to parse as URL
      const urlObj = new URL(url);
      const roomParam = urlObj.searchParams.get('room');
      if (roomParam) return roomParam;
    } catch {
      // Not a valid URL, try to extract room number directly
      const roomMatch = url.match(/room[=:]?\s*(\d+)/i);
      if (roomMatch) return roomMatch[1];
    }
    return null;
  };

  const handleScanSuccess = (decodedText: string) => {
    console.log('QR Code scanned:', decodedText);
    
    const roomNumber = extractRoomFromUrl(decodedText);
    
    if (roomNumber) {
      setScannedRoom(roomNumber);
      setError('');
      
      // Stop scanning
      stopScanning();
      
      // Redirect to homepage with room parameter
      setTimeout(() => {
        router.push(`/?room=${roomNumber}`);
      }, 500);
    } else {
      setError('Invalid QR code. Please scan a valid room QR code.');
    }
  };

  const startCameraScanning = async () => {
    try {
      setError('');
      setIsScanning(true);

      // Clean up any existing scanner
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {
          console.log('No active scanner to stop');
        }
      }

      // Wait a bit for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      
      if (devices && devices.length > 0) {
        console.log('Found cameras:', devices.length);
        
        // Use the first available camera (usually back camera on mobile)
        const cameraId = devices[0].id;
        
        await html5QrCode.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          handleScanSuccess,
          (errorMessage) => {
            // Ignore scan errors (happens when no QR code is in view)
          }
        );
        
        console.log('Camera started successfully!');
      } else {
        setError('No camera found. Please try uploading an image.');
        setIsScanning(false);
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please try uploading an image.');
      } else if (err.message && err.message.includes('Permission')) {
        setError('Camera permission denied. Please check your browser settings.');
      } else {
        setError('Unable to start camera. Please try uploading an image.');
      }
      
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError('');

      const html5QrCode = new Html5Qrcode('qr-reader-upload');
      
      const decodedText = await html5QrCode.scanFile(file, true);
      handleScanSuccess(decodedText);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Could not read QR code from image. Please try another image.');
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {!isScanning ? (
        <div className="space-y-3">
          {/* Camera Scan Button */}
          <button
            onClick={startCameraScanning}
            className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-700 text-gray-900 font-bold py-4 px-6 rounded-2xl transition transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-amber-500/30 flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            <span className="text-2xl">📱</span>
            <span className="text-base">Scan QR Code</span>
          </button>

          {/* Upload QR Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-white hover:bg-gray-50 text-pista-700 font-bold py-4 px-6 rounded-2xl transition border-2 border-pista-300 hover:border-pista-400 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
          >
            <span className="text-2xl">📤</span>
            <span className="text-base">Upload QR Image</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Hidden div for upload scanning */}
          <div id="qr-reader-upload" className="hidden"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Camera Scanner View */}
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl">
            <div id="qr-reader" className="w-full min-h-[300px]"></div>
            <div className="absolute inset-0 border-4 border-amber-400/50 rounded-2xl pointer-events-none"></div>
          </div>

          <button
            onClick={stopScanning}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-2xl transition shadow-lg"
          >
            Stop Scanning
          </button>
        </div>
      )}

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm text-red-700 font-medium flex-1">{error}</p>
          </div>
        </div>
      )}

      {scannedRoom && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-4 animate-pulse shadow-lg">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-xl">✓</span>
            </div>
            <p className="text-sm text-green-700 font-bold">
              Room {scannedRoom} detected! Redirecting...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
