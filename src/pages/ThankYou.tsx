import { useState, useEffect } from 'react';
import { KPICard } from '../components/KPICard';
import { DataTable, type Column } from '../components/DataTable';
import { PeriodSelector } from '../components/PeriodSelector';
import { dashboard } from '../lib/api';
import { formatCurrency, formatCurrencyDetailed, formatCompact } from '../lib/formatters';
import type { ThankYouReceipt, ReportingPeriod } from '../lib/types';
import { Heart, Users, DollarSign, Gift } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_PALETTE } from '../lib/chartColors';

export function ThankYou() {
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [, setPeriod] = useState<ReportingPeriod | null>(null);
  const [receipts, setReceipts] = useState<ThankYouReceipt[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!periodId) return;
    setLoading(true);
    dashboard.thankyou(periodId)
      .then(r => setReceipts(r.receipts))
      .catch(() => setReceipts([]))
      .finally(() => setLoading(false));
  }, [periodId]);

  const totalGifts = receipts.reduce((s, r) => s + (r.gifts || 0), 0);
  const totalDonors = receipts.reduce((s, r) => s + (r.donors || 0), 0);
  const totalGiven = receipts.reduce((s, r) => s + (r.total_given || 0), 0);
  const avgPerGift = totalGifts > 0 ? totalGiven / totalGifts : 0;

  const chartData = receipts.map(r => ({
    name: r.description?.replace(/Direct Mail, thank you letter donation, /i, '') || r.appeal_id,
    'Total Given': r.total_given || 0,
    Gifts: r.gifts || 0,
  }));

  const columns: Column<ThankYouReceipt>[] = [
    { key: 'appeal_id', label: 'Appeal ID' },
    { key: 'description', label: 'Description', render: r => <span className="text-xs">{r.description || '--'}</span> },
    { key: 'gifts', label: 'Gifts', align: 'right', render: r => formatCompact(r.gifts) },
    { key: 'donors', label: 'Donors', align: 'right', render: r => formatCompact(r.donors) },
    { key: 'total_given', label: 'Total Given', align: 'right', render: r => formatCurrency(r.total_given) },
    { key: 'avg_per_gift', label: 'Avg/Gift', align: 'right', render: r => formatCurrencyDetailed(r.avg_per_gift) },
    { key: 'avg_per_donor', label: 'Avg/Donor', align: 'right', render: r => formatCurrencyDetailed(r.avg_per_donor) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Thank You Receipts</h1>
        <PeriodSelector value={periodId} onChange={(id, p) => { setPeriodId(id); setPeriod(p); }} />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : !receipts.length ? (
        <div className="text-center py-20 text-gray-400">No thank you receipt data for this period.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label="Total Gifts" value={formatCompact(totalGifts)} icon={Gift} color="rose" />
            <KPICard label="Total Donors" value={formatCompact(totalDonors)} icon={Users} color="blue" />
            <KPICard label="Total Given" value={formatCurrency(totalGiven)} icon={DollarSign} color="green" />
            <KPICard label="Avg per Gift" value={formatCurrency(avgPerGift)} icon={Heart} color="amber" />
          </div>

          {chartData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Monthly Comparison</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number, name: string) => name === 'Total Given' ? formatCurrency(v) : v} />
                    <Bar dataKey="Total Given" fill={CHART_PALETTE[0]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">All Receipts</h3>
            </div>
            <DataTable data={receipts} columns={columns} keyField="id" />
          </div>
        </>
      )}
    </div>
  );
}
