'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';
import QrTableTentCard from '@/components/QrTableTentCard';
import {
  buildTableTentPrintHtml,
  downloadTableTentCard,
  getTableTentCardDataUrl,
} from '@/lib/qrTableTentCard';
import { getTableQrUrl } from '@/lib/styledQr';

const SECTION_COLORS: Record<string, string> = {
  main:        'bg-blue-50   text-blue-700   border-blue-200',
  outdoor:     'bg-green-50  text-green-700  border-green-200',
  bar:         'bg-purple-50 text-purple-700 border-purple-200',
  private:     'bg-amber-50  text-amber-700  border-amber-200',
};

function tentInput(table: any, restaurant: any) {
  return {
    restaurantName: restaurant?.name || 'Restaurant',
    logoUrl: restaurant?.logo || null,
    tableNumber: table.tableNumber,
    section: table.section,
    qrCode: table.qrCode,
    qrUrl: getTableQrUrl(table.qrCode),
  };
}

export default function QRCodesPage() {
  const { staff, token } = useAuthStore();
  const [tables, setTables] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterSection, setFilterSection] = useState('all');
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [previewTable, setPreviewTable] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  const load = async () => {
    if (!staff?.restaurantId || !token) return;
    const [t, r]: any = await Promise.all([
      adminApi.getTables(staff.restaurantId, token),
      adminApi.getRestaurant(staff.restaurantId, token),
    ]);
    setTables(t);
    setRestaurant(r);
    setLoading(false);
  };

  useEffect(() => { load(); }, [staff, token]);

  const sections = ['all', ...Array.from(new Set(tables.map((t) => t.section)))];

  const filtered = filterSection === 'all'
    ? tables
    : tables.filter((t) => t.section === filterSection);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filtered.map((t) => t.id)));
  const clearAll = () => setSelected(new Set());

  const regenerateQR = async (id: string) => {
    if (!staff?.restaurantId || !token) return;
    setRegenerating(id);
    try {
      await adminApi.regenerateQR(staff.restaurantId, id, token);
      await load();
    } finally { setRegenerating(null); }
  };

  const downloadCard = async (table: any) => {
    setDownloading(true);
    try {
      await downloadTableTentCard(tentInput(table, restaurant));
    } finally { setDownloading(false); }
  };

  const downloadSelected = async () => {
    const toDownload = tables.filter((t) => selected.has(t.id));
    setDownloading(true);
    try {
      for (let i = 0; i < toDownload.length; i++) {
        await new Promise((r) => setTimeout(r, i * 400));
        await downloadTableTentCard(tentInput(toDownload[i], restaurant));
      }
    } finally { setDownloading(false); }
  };

  const printSelected = async () => {
    const toPrint = tables.filter((t) => selected.has(t.id));
    if (!toPrint.length) return;

    setDownloading(true);
    try {
      const cards = await Promise.all(
        toPrint.map(async (table) => ({
          tableNumber: table.tableNumber,
          dataUrl: await getTableTentCardDataUrl(tentInput(table, restaurant), 3),
        })),
      );

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(
        buildTableTentPrintHtml(cards, restaurant?.name || 'Restaurant'),
      );
      printWindow.document.close();
    } finally { setDownloading(false); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-gray-900">QR Table Tent Cards</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              {tables.length} tables · {selected.size} selected · Download &amp; print ready
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <>
                <button onClick={downloadSelected} disabled={downloading}
                  className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50">
                  {downloading ? '…' : `⬇ Download (${selected.size})`}
                </button>
                <button onClick={printSelected} disabled={downloading}
                  className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
                  🖨️ Print ({selected.size})
                </button>
              </>
            )}
          </div>
        </div>

        {/* Section filter + select all */}
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {sections.map((s) => (
              <button key={s} onClick={() => setFilterSection(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${filterSection === s ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-orange-300'}`}>
                {s === 'all' ? `All (${tables.length})` : `${s} (${tables.filter((t) => t.section === s).length})`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={selectAll} className="text-xs text-orange-500 font-semibold hover:text-orange-600">Select All</button>
            <span className="text-gray-200">|</span>
            <button onClick={clearAll} className="text-xs text-gray-400 font-semibold hover:text-gray-600">Clear</button>
          </div>
        </div>

        {/* Card Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton aspect-[2/3]" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card py-20 text-center">
            <div className="text-5xl mb-3">📱</div>
            <p className="text-gray-400">No tables found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((table) => {
              const isSelected = selected.has(table.id);
              return (
                <div key={table.id}
                  onClick={() => toggleSelect(table.id)}
                  className={`relative cursor-pointer transition-all hover:shadow-lg group rounded-xl overflow-hidden ${isSelected ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}>

                  {/* Checkbox */}
                  <div className={`absolute top-2 left-2 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all z-20 ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white/90 group-hover:border-orange-400'}`}>
                    {isSelected && <span className="text-white text-xs font-black">✓</span>}
                  </div>

                  {/* Section badge */}
                  <div className="absolute top-2 right-2 z-20">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border capitalize shadow-sm ${SECTION_COLORS[table.section] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      {table.section}
                    </span>
                  </div>

                  {/* Tent card preview */}
                  {table.qrCode ? (
                    <QrTableTentCard
                      restaurantName={restaurant?.name || 'Restaurant'}
                      logoUrl={restaurant?.logo}
                      tableNumber={table.tableNumber}
                      section={table.section}
                      qrCode={table.qrCode}
                      compact
                    />
                  ) : (
                    <div className="aspect-[2/3] bg-gray-50 flex items-center justify-center">
                      <span className="text-gray-300 text-sm">No QR</span>
                    </div>
                  )}

                  {/* Actions overlay */}
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-8 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button onClick={() => setPreviewTable(table)}
                      className="flex-1 text-xs bg-white/90 text-gray-800 py-1.5 rounded-lg font-semibold hover:bg-white">
                      👁 Preview
                    </button>
                    <button onClick={() => downloadCard(table)} disabled={downloading}
                      className="flex-1 text-xs bg-orange-500 text-white py-1.5 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50">
                      ⬇ Save
                    </button>
                    <button onClick={() => regenerateQR(table.id)} disabled={regenerating === table.id}
                      className="text-xs bg-white/90 text-gray-600 px-2 py-1.5 rounded-lg font-semibold disabled:opacity-50"
                      title="Regenerate QR">
                      {regenerating === table.id ? '…' : '↻'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
            <div className="bg-gray-900 text-white rounded-2xl px-6 py-4 flex items-center gap-4 shadow-2xl">
              <span className="text-sm font-semibold">{selected.size} table{selected.size > 1 ? 's' : ''} selected</span>
              <div className="w-px h-5 bg-white/20" />
              <button onClick={downloadSelected} disabled={downloading}
                className="flex items-center gap-2 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors disabled:opacity-50">
                ⬇ Download All
              </button>
              <button onClick={printSelected} disabled={downloading}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50">
                🖨️ Print All
              </button>
              <button onClick={clearAll} className="text-white/40 hover:text-white/70 text-sm">✕</button>
            </div>
          </div>
        )}

        {/* Preview modal */}
        {previewTable && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewTable(null)}>
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}>

              <h2 className="text-center font-black text-gray-900 text-lg mb-1">Print Preview</h2>
              <p className="text-center text-gray-400 text-xs mb-4">Table {previewTable.tableNumber} · Ready to place on table</p>

              <div className="max-w-[280px] mx-auto mb-5 shadow-xl rounded-xl overflow-hidden">
                <QrTableTentCard
                  restaurantName={restaurant?.name || 'Restaurant'}
                  logoUrl={restaurant?.logo}
                  tableNumber={previewTable.tableNumber}
                  section={previewTable.section}
                  qrCode={previewTable.qrCode}
                />
              </div>

              <div className="flex gap-2">
                <button onClick={() => downloadCard(previewTable)} disabled={downloading}
                  className="flex-1 btn-secondary text-sm disabled:opacity-50">
                  {downloading ? 'Generating…' : '⬇ Download PNG'}
                </button>
                <button onClick={() => {
                  setSelected(new Set([previewTable.id]));
                  setPreviewTable(null);
                  setTimeout(printSelected, 100);
                }} className="flex-1 btn-primary text-sm">🖨️ Print</button>
              </div>
              <button onClick={() => setPreviewTable(null)} className="mt-3 text-gray-400 text-sm hover:text-gray-600 w-full text-center">Close</button>
            </div>
          </div>
        )}
      </div>
  );
}
