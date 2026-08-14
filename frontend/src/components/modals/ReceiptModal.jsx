import React from 'react';
import { X, Printer, CheckCircle, PackageSearch, ShieldCheck } from 'lucide-react';

const ReceiptModal = ({ isOpen, onClose, saleData }) => {
  if (!isOpen || !saleData) return null;

  const { sale } = saleData;

  const formattedDate = new Date(sale?.created_at || Date.now()).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  });

  const handlePrint = () => {
    const itemsHtml = sale?.items?.map((item) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <strong style="display: block; font-size: 12px; color: #0f172a;">${item.product_name}</strong>
          <span style="font-family: monospace; font-size: 10px; color: #64748b;">${item.product_sku}</span>
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: center; font-family: monospace; font-size: 12px; color: #334155;">
          ${item.quantity} &times; GHS ${parseFloat(item.unit_price).toFixed(2)}
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: bold; font-size: 12px; color: #0f172a;">
          GHS ${(item.quantity * parseFloat(item.unit_price)).toFixed(2)}
        </td>
      </tr>
    `).join('') || '';

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt #${sale?.id} - InvenTrack</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; background: #ffffff; color: #0f172a; }
            .receipt-card { max-width: 400px; margin: 0 auto; border: 2px solid #0f172a; border-radius: 12px; padding: 24px; background: #ffffff; }
            .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 14px; margin-bottom: 16px; }
            .title { font-size: 20px; font-weight: 800; color: #0369a1; margin: 0; letter-spacing: -0.5px; }
            .subtitle { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; }
            .meta { font-size: 11px; color: #64748b; font-family: monospace; margin-top: 8px; }
            .meta strong { color: #0369a1; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            .table th { border-bottom: 2px solid #0f172a; padding: 6px 0; text-align: left; font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
            .status-badge { display: inline-block; background: #d1fae5; color: #065f46; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 9999px; border: 1px solid #a7f3d0; }
            .total-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin-top: 14px; }
            .total-row { display: flex; justify-content: space-between; align-items: center; }
            .total-label { font-size: 14px; font-weight: 800; color: #0f172a; }
            .total-amount { font-size: 22px; font-family: monospace; font-weight: 800; color: #047857; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #64748b; }
            .footer p { margin: 2px 0; }
            @media print {
              body { padding: 0; }
              .receipt-card { border: 2px solid #0f172a !important; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <h1 class="title">INVENTRACK RETAIL SHOP</h1>
              <div class="subtitle">Official Counter Sale Receipt</div>
              <div class="meta">
                <span>Receipt #: <strong>#${sale?.id}</strong></span> &bull; <span>${formattedDate}</span>
              </div>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th style="text-align: center;">Qty &times; Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="total-box">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 11px; color: #64748b;">
                <span>Payment Status:</span>
                <span class="status-badge">PAID IN FULL (CASH)</span>
              </div>
              <div class="total-row" style="border-top: 1px solid #cbd5e1; padding-top: 8px;">
                <span class="total-label">TOTAL VALUE:</span>
                <span class="total-amount">GHS ${parseFloat(sale?.total_value || 0).toFixed(2)}</span>
              </div>
            </div>

            <div class="footer">
              <p style="font-weight: bold; color: #334155;">Thank you for shopping with us!</p>
              <p style="font-family: monospace; font-size: 10px;">InvenTrack ERP &bull; Transaction #${sale?.id} &bull; Ghana Branch</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=550,height=700');
    if (printWindow) {
      printWindow.document.write(printHtml);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  return (
    <div className="printable-receipt-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="printable-receipt-card bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Top Header Controls */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Sale Transaction Completed
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal On-Screen Receipt Display */}
        <div className="p-6 space-y-5">
          {/* Brand Header */}
          <div className="text-center space-y-1.5 pb-4 border-b border-dashed border-slate-700/80">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <div className="w-7 h-7 bg-sky-600 rounded-lg flex items-center justify-center text-white font-bold">
                <PackageSearch className="w-4 h-4" />
              </div>
              <h2 className="receipt-header-title text-xl font-extrabold text-slate-100 tracking-tight">
                INVENTRACK RETAIL SHOP
              </h2>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Counter Sale Receipt
            </p>
            <div className="text-[11px] text-slate-400 font-mono pt-1 flex items-center justify-center space-x-3">
              <span>Receipt #: <strong className="text-sky-400">#{sale?.id}</strong></span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-3">
            <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5">
              <div className="col-span-6">Item Description</div>
              <div className="col-span-3 text-center">Qty &times; Price</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {sale?.items?.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-xs items-start py-1.5 border-b border-slate-800/40">
                  <div className="col-span-6 flex flex-col">
                    <span className="font-bold text-slate-100">{item.product_name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{item.product_sku}</span>
                  </div>
                  <div className="col-span-3 text-center font-mono text-slate-300">
                    {item.quantity} &times; GHS {parseFloat(item.unit_price).toFixed(2)}
                  </div>
                  <div className="col-span-3 text-right font-mono font-bold text-slate-100">
                    GHS {(item.quantity * parseFloat(item.unit_price)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Status:</span>
              <span className="inline-flex items-center text-emerald-400 font-bold text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                <ShieldCheck className="w-3 h-3 mr-1" />
                PAID IN FULL (CASH)
              </span>
            </div>
            <div className="flex items-center justify-between text-base font-extrabold text-slate-100 pt-2 border-t border-slate-800">
              <span>TOTAL AMOUNT:</span>
              <span className="receipt-total-value text-2xl font-mono text-emerald-400 font-extrabold">
                GHS {parseFloat(sale?.total_value || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-2 space-y-1">
            <p className="text-xs font-bold text-slate-300">Thank you for shopping with us!</p>
            <p className="text-[10px] text-slate-500 font-mono">
              InvenTrack ERP System &bull; Verified Receipt #{sale?.id}
            </p>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="no-print flex items-center justify-end space-x-3 px-6 py-4 bg-slate-950 border-t border-slate-800/80">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-all shadow-md shadow-sky-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
