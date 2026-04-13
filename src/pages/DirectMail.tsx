import { useState, useEffect } from 'react';
import { KPICard } from '../components/KPICard';
import { DataTable, type Column } from '../components/DataTable';
import { PeriodSelector } from '../components/PeriodSelector';
import { dashboard } from '../lib/api';
import { formatCurrency, formatCurrencyDetailed, formatCompact, formatPct } from '../lib/formatters';
import type { DirectMailAppeal, ReportingPeriod } from '../lib/types';
import { DollarSign, Gift, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_PALETTE } from '../lib/chartColors';

export function DirectMail() {
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [, setPeriod] = useState<ReportingPeriod | null>(null);
  const [appeals, setAppeals] = useState<DirectMailAppeal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!periodId) return;
    setLoading(true);
    dashboard.mail(periodId)
      .then(r => setAppeals(r.appeals))
      .catch(() => setAppeals([]))
      .finally(() => setLoading(false));
  }, [periodId]);

  const totalGiven = appeals.reduce((s, a) => s + (a.total_given || 0), 0);
  const totalGifts = appeals.reduce((s, a) => s + (a.gifts || 0), 0);
  const totalDonors = appeals.reduce((s, a) => s + (a.donors || 0), 0);
  const totalCost = appeals.reduce((s, a) => s + (a.total_cost || 0), 0);
  const profitLoss = appeals.reduce((s, a) => s + (a.profit_loss || 0), 0);
  const avgPerGift = totalGifts > 0 ? totalGiven / totalGifts : 0;

  const chartData = appeals.map(a => ({
    name: a.appeal_id,
    'Total Given': a.total_given || 0,
    'Total Cost': a.total_cost || 0,
    'Profit': a.profit_loss || 0,
  }));

  const columns: Column<DirectMailAppeal>[] = [
    { key: 'appeal_id', label: 'Appeal ID' },
    { key: 'description', label: 'Description', render: r => <span className="text-xs">{r.description || '--'}</span> },
    { key: 'num_solicitors', label: 'Solicitors', align: 'right', render: r => formatCompact(r.num_solicitors) },
    { key: 'gifts', label: 'Gifts', align: 'right', render: r => formatCompact(r.gifts) },
    { key: 'donors', label: 'Donors', align: 'right', render: r => formatCompact(r.donors) },
    { key: 'response_pct', label: '% Resp', align: 'right', render: r => formatPct(r.response_pct) },
    { key: 'total_given', label: 'Total Given', align: 'right', render: r => formatCurrency(r.total_given) },
    { key: 'avg_per_gift', label: 'Avg/Gift', align: 'right', render: r => formatCurrencyDetailed(r.avg_per_gift) },
    { key: 'total_cost', label: 'Total Cost', align: 'right', render: r => formatCurrency(r.total_cost) },
    { key: 'profit_loss', label: 'Profit/Loss', align: 'right', render: r => {
      const v = r.profit_loss;
      if (v == null) return '--';
      return <span className={v >= 0 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>{formatCurrency(v)}</span>;
    }},
    { key: 'cost_per_donor', label: 'Cost/Donor', align: 'right', render: r => formatCurrencyDetailed(r.cost_per_donor) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Direct Mail Appeals</h1>
        <PeriodSelector value={periodId} onChange={(id, p) => { setPeriodId(id); setPeriod(p); }} />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : !appeals.length ? (
        <div className="text-center py-20 text-gray-400">No direct mail data for this period.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label="Total Given" value={formatCurrency(totalGiven)} icon={DollarSign} color="green" />
            <KPICard label="Total Gifts" value={formatCompact(totalGifts)} icon={Gift} color="blue" />
            <KPICard label="Avg per Gift" value={formatCurrency(avgPerGift)} color="amber" />
            <KPICard
              label="Profit/Loss"
              value={formatCurrency(profitLoss)}
              icon={TrendingUp}
              color={profitLoss >= 0 ? 'green' : 'rose'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-sm space-y-2">
              <h3 className="font-semibold text-gray-700">Summary</h3>
              <div className="flex justify-between"><span className="text-gray-500">Appeals</span><span className="font-medium">{appeals.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Donors</span><span className="font-medium">{formatCompact(totalDonors)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Cost</span><span className="font-medium">{formatCurrency(totalCost)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Avg Response</span><span className="font-medium">{formatPct(totalGifts && appeals.reduce((s, a) => s + (a.num_solicitors || 0), 0) ? (totalGifts / appeals.reduce((s, a) => s + (a.num_solicitors || 0), 0)) * 100 : 0)}</span></div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Appeal Comparison</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="Total Given" fill={CHART_PALETTE[0]} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Total Cost" fill={CHART_PALETTE[5]} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Profit" fill={CHART_PALETTE[3]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">All Appeals</h3>
            </div>
            <DataTable data={appeals} columns={columns} keyField="id" />
          </div>
        </>
      )}
    </div>
  );
}
