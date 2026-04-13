import { useState, useEffect } from 'react';
import { uploads as uploadsApi, periods as periodsApi, data as dataApi } from '../lib/api';
import type { UploadLogEntry, ReportingPeriod } from '../lib/types';
import { DataTable, type Column } from '../components/DataTable';
import { Database, Calendar, Trash2 } from 'lucide-react';

export function Admin() {
  const [uploadLog, setUploadLog] = useState<UploadLogEntry[]>([]);
  const [periods, setPeriods] = useState<ReportingPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      uploadsApi.list().then(r => setUploadLog(r.uploads)).catch(() => {}),
      periodsApi.list().then(r => setPeriods(r.periods)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  async function handleDelete(category: string, periodId: number) {
    if (!confirm(`Delete all ${category} data for this period?`)) return;
    try {
      await dataApi.deletePeriod(category, periodId);
      alert('Deleted successfully');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  const uploadColumns: Column<UploadLogEntry>[] = [
    { key: 'created_at', label: 'Date', render: r => <span className="text-xs">{r.created_at}</span> },
    { key: 'data_category', label: 'Category', render: r => (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">{r.data_category}</span>
    )},
    { key: 'period_label', label: 'Period' },
    { key: 'rows_imported', label: 'Rows', align: 'right' },
    { key: 'status', label: 'Status', render: r => (
      <span className={`text-xs font-medium ${r.status === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>{r.status}</span>
    )},
    { key: 'notes', label: 'Notes', render: r => <span className="text-xs text-gray-500">{r.notes || '--'}</span> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-primary" />
          <h2 className="text-sm font-semibold text-gray-700">Reporting Periods</h2>
        </div>
        {loading ? <div className="text-gray-400 text-sm">Loading...</div> : (
          <div className="flex flex-wrap gap-2">
            {periods.map(p => (
              <div key={p.id} className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 border border-gray-200">
                {p.label}
              </div>
            ))}
            {!periods.length && <span className="text-gray-400 text-sm">No periods yet</span>}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 size={18} className="text-danger" />
          <h2 className="text-sm font-semibold text-gray-700">Delete Data by Period</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3">Select a category and period to delete all records for that combination.</p>
        <div className="flex flex-wrap gap-2">
          {['social_media', 'direct_mail', 'email', 'thank_you'].map(cat => (
            periods.map(p => (
              <button
                key={`${cat}-${p.id}`}
                onClick={() => handleDelete(cat, p.id)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-colors"
              >
                {cat.replace('_', ' ')} - {p.label}
              </button>
            ))
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Database size={18} className="text-primary" />
          <h2 className="text-sm font-semibold text-gray-700">Upload History</h2>
        </div>
        <DataTable data={uploadLog} columns={uploadColumns} keyField="id" emptyMessage="No uploads yet. Data is loaded via Claude." />
      </div>
    </div>
  );
}
