/**
 * 80mm thermal POS receipt — professional restaurant bill generator
 */

export interface ThermalBillConfig {
  order: any;
  billImage?: string | null;
  billImageLabel?: string;
  logoUrl?: string | null;
  autoPrint?: boolean;
  gstin?: string | null;
}

function esc(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmt(n: number): string {
  return `&#8377;${(n || 0).toFixed(2)}`;
}

/** Pad left so value aligns to a fixed total width */
function padL(str: string, width: number): string {
  return str.padStart(width);
}

/** Truncate + pad right for item name column */
function padR(str: string, width: number): string {
  const s = String(str).substring(0, width);
  return s.padEnd(width);
}

function buildItemRows(items: any[]): string {
  if (!items?.length) return `<tr><td colspan="4" style="text-align:center;padding:6px 0;font-size:10px;">No items</td></tr>`;
  return items.map((item) => {
    const name = esc(item.menuItem?.name || 'Item');
    const qty = item.quantity || 1;
    const unit = (item.price || 0).toFixed(2);
    const total = ((item.price || 0) * qty).toFixed(2);
    return `
      <tr>
        <td class="col-name">${name}</td>
        <td class="col-qty">${qty}</td>
        <td class="col-price">${unit}</td>
        <td class="col-total">${total}</td>
      </tr>`;
  }).join('');
}

function buildSummary(order: any, r: any): string {
  const sub = order.subtotal || 0;
  const discount = order.discountAmount || 0;
  const taxable = sub - discount;
  const svc = order.serviceCharge || 0;
  const cgstPct = r.cgstPercentage || 0;
  const sgstPct = r.sgstPercentage || 0;
  const cgst = (order.cgstAmount || 0) > 0 ? order.cgstAmount : (taxable * cgstPct) / 100;
  const sgst = (order.sgstAmount || 0) > 0 ? order.sgstAmount : (taxable * sgstPct) / 100;
  const grand = order.totalAmount || 0;

  const row = (label: string, value: string, cls = '') =>
    `<div class="sum-row ${cls}"><span>${label}</span><span>${value}</span></div>`;

  const dash = `<div class="dash-line"></div>`;

  let html = '';
  html += row('Subtotal', fmt(sub));
  if (discount > 0) html += row(`Discount${order.couponCode ? ` (${esc(order.couponCode)})` : ''}`, `&minus;${fmt(discount)}`, 'discount');
  html += dash;
  html += row('Taxable Amount', fmt(taxable), 'taxable');
  if (svc > 0) html += row(`Service (${r.serviceChargePercentage || 0}%)`, fmt(svc));
  if (cgst > 0 || cgstPct > 0) html += row(`CGST (${cgstPct}%)`, fmt(cgst));
  if (sgst > 0 || sgstPct > 0) html += row(`SGST (${sgstPct}%)`, fmt(sgst));
  html += dash;
  html += `<div class="grand-row"><span>GRAND TOTAL</span><span>${fmt(grand)}</span></div>`;
  html += dash;

  return html;
}

export function buildThermalBillDocument(config: ThermalBillConfig): string {
  const { order, billImage, billImageLabel = 'Scan to Pay', logoUrl, autoPrint = true } = config;
  const r = order.restaurant || {};
  const orderShort = esc(order.orderNumber?.slice(-8) || '—');
  const created = new Date(order.createdAt).toLocaleString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const isPaid = order.paymentStatus === 'completed';

  const logoBlock = logoUrl
    ? `<div class="logo-wrap"><img src="${esc(logoUrl)}" alt="" class="logo-img" /></div>`
    : '';

  const qrBlock = billImage ? `
    <div class="qr-section">
      <div class="dash-sep"></div>
      <p class="qr-label">&#9654; ${esc(billImageLabel)}</p>
      <div class="qr-box">
        <img src="${billImage.replace(/"/g, '&quot;')}" alt="QR" class="qr-img" />
      </div>
      <p class="qr-hint">Scan with any UPI app to pay</p>
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Bill #${orderShort}</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{-webkit-print-color-adjust:exact;print-color-adjust:exact}

    body{
      font-family:'Courier New',Courier,'Liberation Mono',monospace;
      background:#c8c8c8;
      color:#000;
      font-size:11px;
      line-height:1.4;
    }

    /* ── Toolbar ── */
    .toolbar{
      position:sticky;top:0;z-index:100;
      display:flex;flex-wrap:wrap;gap:8px;
      justify-content:center;align-items:center;
      padding:10px 16px;
      background:#111827;
    }
    .toolbar button{
      font-family:system-ui,sans-serif;font-size:13px;font-weight:600;
      padding:7px 18px;border:none;border-radius:6px;cursor:pointer;
    }
    .btn-print{background:#f97316;color:#fff}
    .btn-pdf{background:#e5e7eb;color:#111}
    .btn-close{background:#374151;color:#fff}

    /* ── Preview wrapper ── */
    .preview{
      display:flex;justify-content:center;
      padding:20px 12px 48px;
    }

    /* ── Receipt ── */
    .receipt{
      width:80mm;max-width:80mm;min-width:80mm;
      background:#fff;
      padding:4mm 3.5mm 5mm;
      box-shadow:0 6px 32px rgba(0,0,0,.22);
    }

    /* Header */
    .logo-wrap{text-align:center;margin-bottom:3px}
    .logo-img{max-width:20mm;max-height:12mm;object-fit:contain}

    .store-name{
      text-align:center;
      font-size:14px;font-weight:700;
      letter-spacing:.14em;text-transform:uppercase;
      margin-bottom:2px;
    }
    .store-tagline{
      text-align:center;font-size:9px;
      letter-spacing:.06em;color:#444;
      margin-bottom:3px;
    }
    .store-meta{
      text-align:center;font-size:9.5px;
      color:#333;line-height:1.5;
    }

    /* Separators */
    .dash-sep{
      border:none;border-top:1px dashed #000;
      margin:5px 0;
    }
    .solid-sep{
      border:none;border-top:2px solid #000;
      margin:5px 0;
    }
    .dash-line{
      border-top:1px dashed #000;
      margin:4px 0;
    }

    /* Order info */
    .order-block{text-align:center;padding:3px 0}
    .order-id{font-size:12px;font-weight:700;letter-spacing:.06em}
    .order-sub{font-size:10px;margin-top:2px;color:#222}
    .order-time{font-size:9.5px;color:#555;margin-top:1px}

    /* Items table */
    .items-table{
      width:100%;border-collapse:collapse;
      margin:4px 0;
    }
    .items-table thead tr{
      border-bottom:1px dashed #000;
    }
    .items-table thead th{
      font-size:9px;font-weight:700;
      text-transform:uppercase;letter-spacing:.07em;
      padding:2px 0;color:#333;
    }
    .col-name{text-align:left;width:46%}
    .col-qty{text-align:center;width:10%}
    .col-price{text-align:right;width:22%}
    .col-total{text-align:right;width:22%}

    .items-table tbody tr{border-bottom:1px dotted #ccc}
    .items-table tbody tr:last-child{border-bottom:none}
    .items-table tbody td{
      font-size:10.5px;padding:4px 0;vertical-align:top;
    }
    .items-table tbody td.col-name{font-weight:600;word-break:break-word}

    /* Summary */
    .summary{margin-top:2px}
    .sum-row{
      display:flex;justify-content:space-between;
      font-size:10.5px;padding:2px 0;
    }
    .sum-row.discount span{color:#000;font-weight:700}
    .sum-row.taxable{font-weight:700;font-size:11px}

    .grand-row{
      display:flex;justify-content:space-between;align-items:baseline;
      font-size:14px;font-weight:700;
      letter-spacing:.06em;
      padding:4px 0;
    }

    /* Footer */
    .footer{
      text-align:center;font-size:9.5px;
      line-height:1.6;padding:3px 0;
    }
    .powered{
      text-align:center;font-size:8px;
      color:#888;margin-top:6px;letter-spacing:.12em;
    }

    /* QR */
    .qr-section{text-align:center;margin-top:4px}
    .qr-label{
      font-size:10px;font-weight:700;
      letter-spacing:.06em;text-transform:uppercase;
      margin-bottom:5px;
    }
    .qr-box{
      display:inline-block;
      padding:3mm;
      border:1px dashed #000;
      background:#fafafa;
    }
    .qr-img{
      display:block;width:52mm;max-width:100%;
      height:auto;object-fit:contain;margin:0 auto;
    }
    .qr-hint{font-size:8.5px;color:#555;margin-top:4px}

    @media print{
      @page{size:80mm auto;margin:0}
      html,body{width:80mm;margin:0;padding:0;background:#fff!important}
      .no-print{display:none!important}
      .preview{padding:0;display:block}
      .receipt{
        width:80mm;max-width:80mm;min-width:80mm;
        margin:0;padding:2mm 2.5mm 3mm;
        box-shadow:none;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar no-print">
    <button class="btn-print" onclick="window.print()">&#128438; Print Bill</button>
    <button class="btn-pdf" onclick="window.print()">&#128196; Save PDF</button>
    <button class="btn-close" onclick="window.close()">&#10005; Close</button>
  </div>

  <div class="preview">
    <article class="receipt">

      ${logoBlock}
      <h1 class="store-name">${esc(r.name || 'Restaurant')}</h1>
      ${r.description ? `<p class="store-tagline">${esc(r.description)}</p>` : ''}
      <div class="store-meta">
        ${r.address ? `<div>${esc(r.address)}</div>` : ''}
        ${r.phone ? `<div>Tel: ${esc(r.phone)}</div>` : ''}
        ${r.email ? `<div>Email: ${esc(r.email)}</div>` : ''}
        ${config.gstin ? `<div>GSTIN: ${esc(config.gstin)}</div>` : ''}
      </div>

      <div class="dash-sep"></div>

      <div class="order-block">
        <div class="order-id">BILL #${orderShort}</div>
        <div class="order-sub">Table ${esc(order.table?.tableNumber || '—')} &nbsp;|&nbsp; ${esc(order.table?.section || 'Main')}</div>
        <div class="order-time">${esc(created)}</div>
      </div>

      <div class="dash-sep"></div>

      <table class="items-table">
        <thead>
          <tr>
            <th class="col-name">Item</th>
            <th class="col-qty">Qty</th>
            <th class="col-price">Price</th>
            <th class="col-total">Total</th>
          </tr>
        </thead>
        <tbody>
          ${buildItemRows(order.items)}
        </tbody>
      </table>

      <div class="dash-sep"></div>

      <div class="summary">
        ${buildSummary(order, r)}
      </div>

      <div class="dash-sep"></div>

      <div class="footer">
        <p>Thank you for dining with us!</p>
        <p>Please visit again &#9829;</p>
      </div>

      ${qrBlock}

      <div className="dash-sep"></div>
      <p className="powered">Designed &amp; Developed by <a href="https://dualsparkstudio.com/" target="_blank" style="color:inherit;text-decoration:none;">DualSpark Studio</a></p>

    </article>
  </div>

  ${autoPrint ? `<script>window.addEventListener('load',function(){setTimeout(function(){window.print();},400);});<\/script>` : ''}
</body>
</html>`;
}

export function openThermalBill(config: ThermalBillConfig): Window | null {
  const win = window.open('', '_blank', 'width=440,height=760,scrollbars=yes');
  if (!win) {
    alert('Please allow pop-ups to print the bill.');
    return null;
  }
  win.document.write(buildThermalBillDocument(config));
  win.document.close();
  return win;
}

export function getBillImageFromStorage(restaurantId: string) {
  if (typeof window === 'undefined' || !restaurantId) return { image: null as string | null, label: 'Scan to Pay', gstin: null as string | null };
  return {
    image: localStorage.getItem(`billImage_${restaurantId}`),
    label: localStorage.getItem(`billImageLabel_${restaurantId}`) || 'Scan to Pay',
    gstin: localStorage.getItem(`gstin_${restaurantId}`),
  };
}
