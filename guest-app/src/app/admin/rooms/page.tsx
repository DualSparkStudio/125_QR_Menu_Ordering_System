'use client';

import { useState, useEffect, useRef } from 'react';
import { useRoomsStore, Room } from '@/store/roomsStore';
import QRCode from 'qrcode.react';

export default function RoomsPage() {
  const { rooms, initializeRooms, updateRoom, markQRGenerated } = useRoomsStore();
  const [filter, setFilter] = useState<'all' | Room['status']>('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeRooms();
  }, [initializeRooms]);

  const filteredRooms = filter === 'all' ? rooms : rooms.filter(r => r.status === filter);

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'Occupied': return 'bg-green-100 text-green-700 border-green-200';
      case 'Vacant': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Maintenance': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeColor = (type: Room['type']) => {
    switch (type) {
      case 'Standard': return 'bg-gray-100 text-gray-700';
      case 'Deluxe': return 'bg-blue-100 text-blue-700';
      case 'Suite': return 'bg-purple-100 text-purple-700';
      case 'Presidential': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleGenerateQR = (room: Room) => {
    setSelectedRoom(room);
    setShowQRModal(true);
    markQRGenerated(room.id);
  };

  const handleDownloadQR = () => {
    if (!qrRef.current || !selectedRoom) return;

    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    // Create a larger canvas for the full design
    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');
    if (!ctx) return;

    finalCanvas.width = 1000;
    finalCanvas.height = 1200;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // Header
    ctx.fillStyle = '#93C572';
    ctx.fillRect(0, 0, finalCanvas.width, 150);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Grand Valley Resort', finalCanvas.width / 2, 70);
    ctx.font = '32px Arial';
    ctx.fillText('Room Service QR Code', finalCanvas.width / 2, 120);

    // Room info
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 72px Arial';
    ctx.fillText(`Room ${selectedRoom.number}`, finalCanvas.width / 2, 230);
    
    ctx.font = '28px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText(`${selectedRoom.type} • Floor ${selectedRoom.floor}`, finalCanvas.width / 2, 280);

    // QR Code
    ctx.drawImage(canvas, 200, 320, 600, 600);

    // Instructions
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Scan to Order Food & Services', finalCanvas.width / 2, 980);
    
    ctx.font = '20px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText('Point your camera at this QR code', finalCanvas.width / 2, 1020);
    ctx.fillText('to access our digital menu', finalCanvas.width / 2, 1050);

    // Footer
    ctx.fillStyle = '#93C572';
    ctx.font = '18px Arial';
    ctx.fillText('Available 24/7 • Fast Delivery • Contactless Service', finalCanvas.width / 2, 1120);

    // Download
    finalCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Room-${selectedRoom.number}-QR.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png', 1.0);
  };

  const handleDownloadAllQRs = async () => {
    if (rooms.length === 0) return;

    // Show a loading message
    const confirmed = confirm(`This will download QR codes for all ${rooms.length} rooms. Continue?`);
    if (!confirmed) return;

    // Download each QR code with a delay
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      setSelectedRoom(room);
      setShowQRModal(true);
      
      // Wait for modal to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Trigger download
      handleDownloadQR();
      
      // Wait before next download
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Close modal if it's the last one
      if (i === rooms.length - 1) {
        setTimeout(() => {
          setShowQRModal(false);
          setSelectedRoom(null);
          alert(`Successfully downloaded ${rooms.length} QR codes!`);
        }, 500);
      }
    }
  };

  const handlePrintQR = () => {
    if (!qrRef.current || !selectedRoom) return;
    
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    // Convert canvas to data URL
    const qrDataUrl = canvas.toDataURL('image/png');
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Room ${selectedRoom.number} QR Code</title>
          <style>
            @media print {
              @page {
                size: A4 portrait;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              margin: 0;
              padding: 40px;
              font-family: Arial, sans-serif;
              text-align: center;
              background: white;
            }
            .header {
              background: #93C572;
              color: white;
              padding: 30px;
              margin: -40px -40px 40px -40px;
            }
            h1 { 
              margin: 0; 
              font-size: 36px; 
            }
            h2 { 
              margin: 10px 0 0 0; 
              font-size: 24px; 
              font-weight: normal; 
            }
            .room-info {
              margin: 30px 0;
            }
            .room-number {
              font-size: 48px;
              font-weight: bold;
              color: #1a1a1a;
              margin-bottom: 10px;
            }
            .room-type {
              font-size: 20px;
              color: #666;
            }
            .qr-container {
              margin: 40px auto;
              padding: 30px;
              border: 4px solid #93C572;
              border-radius: 20px;
              display: inline-block;
              background: white;
            }
            .qr-container img {
              display: block;
              width: 300px;
              height: 300px;
            }
            .instructions {
              margin-top: 40px;
              font-size: 18px;
              color: #666;
            }
            .instructions strong {
              display: block;
              font-size: 20px;
              color: #1a1a1a;
              margin-bottom: 10px;
            }
            .footer {
              margin-top: 40px;
              color: #93C572;
              font-size: 16px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Grand Valley Resort</h1>
            <h2>Room Service QR Code</h2>
          </div>
          <div class="room-info">
            <div class="room-number">Room ${selectedRoom.number}</div>
            <div class="room-type">${selectedRoom.type} • Floor ${selectedRoom.floor}</div>
          </div>
          <div class="qr-container">
            <img src="${qrDataUrl}" alt="QR Code for Room ${selectedRoom.number}" />
          </div>
          <div class="instructions">
            <strong>Scan to Order Food & Services</strong>
            <p>Point your camera at this QR code<br>to access our digital menu</p>
          </div>
          <div class="footer">
            Available 24/7 • Fast Delivery • Contactless Service
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for image to load before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  const qrUrl = selectedRoom 
    ? `${window.location.origin}/?room=${selectedRoom.number}`
    : '';

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-pista-900 mb-2">Rooms Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage rooms and generate QR codes</p>
        </div>
        <button
          onClick={handleDownloadAllQRs}
          className="bg-pista-500 hover:bg-pista-600 text-white font-bold px-4 sm:px-6 py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
        >
          <span className="text-lg sm:text-xl">📥</span>
          <span className="whitespace-nowrap">Download All QR Codes</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <div className="glass-effect border-2 border-pista-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 uppercase mb-1">Total Rooms</p>
          <p className="text-2xl font-bold text-pista-900">{rooms.length}</p>
        </div>
        <div className="glass-effect border-2 border-green-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 uppercase mb-1">Occupied</p>
          <p className="text-2xl font-bold text-green-700">{rooms.filter(r => r.status === 'Occupied').length}</p>
        </div>
        <div className="glass-effect border-2 border-blue-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 uppercase mb-1">Vacant</p>
          <p className="text-2xl font-bold text-blue-700">{rooms.filter(r => r.status === 'Vacant').length}</p>
        </div>
        <div className="glass-effect border-2 border-red-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 uppercase mb-1">Maintenance</p>
          <p className="text-2xl font-bold text-red-700">{rooms.filter(r => r.status === 'Maintenance').length}</p>
        </div>
        <div className="glass-effect border-2 border-purple-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 uppercase mb-1">QR Generated</p>
          <p className="text-2xl font-bold text-purple-700">{rooms.filter(r => r.qrGenerated).length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'Occupied', 'Vacant', 'Maintenance'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? 'bg-pista-500 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-pista-200 hover:border-pista-400'
            }`}
          >
            {status === 'all' ? 'All Rooms' : status}
            {status !== 'all' && ` (${rooms.filter(r => r.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {filteredRooms.map((room) => (
          <div key={room.id} className="glass-effect border-2 border-pista-200 rounded-xl p-5 hover:shadow-xl transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-2xl font-bold text-pista-900">Room {room.number}</h3>
                <p className="text-sm text-gray-600">Floor {room.floor}</p>
              </div>
              {room.qrGenerated && (
                <span className="text-2xl" title="QR Code Generated">✓</span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${getTypeColor(room.type)}`}>
                {room.type}
              </span>
              <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold border-2 ml-2 ${getStatusColor(room.status)}`}>
                {room.status}
              </span>
            </div>

            {room.guestName && (
              <div className="mb-4 bg-pista-50 border border-pista-200 rounded-lg p-3">
                <p className="text-xs text-pista-600 font-semibold mb-1">Guest</p>
                <p className="text-sm text-gray-700 font-medium">{room.guestName}</p>
                {room.checkIn && room.checkOut && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(room.checkIn).toLocaleDateString()} - {new Date(room.checkOut).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => handleGenerateQR(room)}
                className="w-full bg-pista-500 hover:bg-pista-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm flex items-center justify-center gap-2"
              >
                <span>📱</span>
                {room.qrGenerated ? 'View QR Code' : 'Generate QR Code'}
              </button>
              
              <select
                value={room.status}
                onChange={(e) => updateRoom(room.id, { status: e.target.value as Room['status'] })}
                className="w-full px-3 py-2 border-2 border-pista-200 rounded-lg text-sm focus:ring-2 focus:ring-pista-500 focus:border-pista-500 outline-none"
              >
                <option value="Occupied">Occupied</option>
                <option value="Vacant">Vacant</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12 glass-effect border-2 border-pista-200 rounded-xl">
          <span className="text-6xl block mb-4">🛏️</span>
          <p className="text-gray-500 text-lg font-semibold">No rooms found</p>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <div className="bg-pista-500 text-white py-6 -mx-8 -mt-8 mb-6 rounded-t-2xl">
                <h2 className="text-3xl font-bold">Grand Valley Resort</h2>
                <p className="text-lg mt-2">Room Service QR Code</p>
              </div>

              <div className="mb-6">
                <h3 className="text-4xl font-bold text-pista-900">Room {selectedRoom.number}</h3>
                <p className="text-lg text-gray-600 mt-2">{selectedRoom.type} • Floor {selectedRoom.floor}</p>
              </div>

              <div ref={qrRef} className="inline-block p-8 bg-white border-4 border-pista-200 rounded-2xl mb-6">
                <QRCode
                  value={qrUrl}
                  size={300}
                  level="H"
                  includeMargin={true}
                  fgColor="#1a1a1a"
                  bgColor="#ffffff"
                  renderAs="canvas"
                />
              </div>

              <div className="mb-6">
                <p className="text-lg font-semibold text-gray-800 mb-2">Scan to Order Food & Services</p>
                <p className="text-sm text-gray-600">Point your camera at this QR code</p>
                <p className="text-sm text-gray-600">to access our digital menu</p>
              </div>

              <div className="text-pista-600 font-semibold mb-6">
                Available 24/7 • Fast Delivery • Contactless Service
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDownloadQR}
                  className="flex-1 bg-pista-500 hover:bg-pista-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <span>📥</span>
                  Download PNG
                </button>
                <button
                  onClick={handlePrintQR}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <span>🖨️</span>
                  Print
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
