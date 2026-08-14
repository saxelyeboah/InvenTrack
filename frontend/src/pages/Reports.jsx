import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { FileText, Download, Calendar, RefreshCw, Filter } from 'lucide-react';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('stock-level');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError('');
      let url = '/reports/stock-level';
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      if (activeTab === 'stock-movements') {
        url = `/reports/stock-movements?${params.toString()}`;
      } else if (activeTab === 'sales') {
        url = `/reports/sales?${params.toString()}`;
      } else {
        url = `/reports/stock-level`;
      }

      const res = await api.get(url);
      setReportData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const exportToCSV = () => {
    if (!reportData || reportData.length === 0) return;

    const headers = Object.keys(reportData[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of reportData) {
      const values = headers.map((header) => {
        const val = row[header] === null || row[header] === undefined ? '' : String(row[header]);
        const escaped = val.replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventrack_${activeTab}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-page-content flex-1 flex flex-col min-h-0 space-y-5 animate-fade-in">
      {/* Header Card */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 p-5 border border-slate-800/80 rounded-2xl backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Reports & Export Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate Stock Level, Stock Movement Audit, and Sales reports with CSV export triggers.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          disabled={reportData.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 shadow-md shadow-emerald-600/20"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Dribbble Style Tabs & Date Filter Toolbar */}
      <div className="flex-shrink-0 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          {[
            { id: 'stock-level', label: 'Stock Level Report' },
            { id: 'stock-movements', label: 'Stock Movement Audit' },
            { id: 'sales', label: 'Sales Summary' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                activeTab === tab.id
                  ? 'bg-sky-950/80 text-sky-400 border-sky-500/40 font-bold shadow-inner'
                  : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:bg-slate-800/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab !== 'stock-level' && (
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="flex items-center space-x-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Start:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-400">
              <span>End:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none"
              />
            </div>
            <button
              onClick={fetchReport}
              className="p-2 text-slate-400 hover:text-white bg-slate-950/80 border border-slate-800 rounded-xl transition-colors"
              title="Apply Date Filter"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex-shrink-0 bg-rose-950/60 border border-rose-800/80 text-rose-300 p-4 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Report Data Table */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
          {activeTab === 'stock-level' && (
            <table className="w-full text-left text-xs text-slate-300 relative">
              <thead className="bg-slate-950 sticky top-0 z-10 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 shadow-sm">
                <tr>
                  <th className="px-6 py-3.5">SKU Code</th>
                  <th className="px-6 py-3.5">Product Name</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5 text-right">Cost Price</th>
                  <th className="px-6 py-3.5 text-right">Selling Price</th>
                  <th className="px-6 py-3.5 text-center">On-Hand Stock</th>
                  <th className="px-6 py-3.5 text-right">Total Cost Valuation</th>
                  <th className="px-6 py-3.5 text-right">Total Sales Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                      Generating report...
                    </td>
                  </tr>
                ) : (
                  reportData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-sky-400">{row.sku}</td>
                      <td className="px-6 py-4 font-semibold text-slate-100">{row.name}</td>
                      <td className="px-6 py-4 text-slate-400">{row.category_name || 'Uncategorized'}</td>
                      <td className="px-6 py-4 text-right font-mono">GHS {row.cost_price}</td>
                      <td className="px-6 py-4 text-right font-mono text-emerald-400 font-bold">
                        GHS {row.selling_price}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-100">
                        {row.quantity_on_hand}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-300 font-bold">
                        GHS {row.total_cost_value}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sky-400 font-bold">
                        GHS {row.total_selling_value}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'stock-movements' && (
            <table className="w-full text-left text-xs text-slate-300 relative">
              <thead className="bg-slate-950 sticky top-0 z-10 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 shadow-sm">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Product (SKU)</th>
                  <th className="px-6 py-3.5 text-center">Type</th>
                  <th className="px-6 py-3.5 text-center">Qty</th>
                  <th className="px-6 py-3.5">Supplier</th>
                  <th className="px-6 py-3.5">Performed By</th>
                  <th className="px-6 py-3.5">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                      Generating report...
                    </td>
                  </tr>
                ) : (
                  reportData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-slate-400 font-mono">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-100">
                        {row.product_name} ({row.product_sku})
                      </td>
                      <td className="px-6 py-4 text-center font-bold">{row.movement_type}</td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-slate-100">
                        {row.quantity}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{row.supplier_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-300 font-medium">{row.performed_by}</td>
                      <td className="px-6 py-4 text-slate-400 italic">{row.reason || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'sales' && (
            <table className="w-full text-left text-xs text-slate-300 relative">
              <thead className="bg-slate-950 sticky top-0 z-10 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 shadow-sm">
                <tr>
                  <th className="px-6 py-3.5">Sale Bill ID</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Recorded By</th>
                  <th className="px-6 py-3.5 text-center">Total Line Items</th>
                  <th className="px-6 py-3.5 text-right">Total Sale Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      Generating report...
                    </td>
                  </tr>
                ) : (
                  reportData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-sky-400">Sale #{row.id}</td>
                      <td className="px-6 py-4 text-slate-400 font-mono">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-200 font-semibold">{row.recorded_by}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-100">{row.total_items}</td>
                      <td className="px-6 py-4 text-right font-mono text-emerald-400 font-bold">
                        GHS {row.total_value}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
