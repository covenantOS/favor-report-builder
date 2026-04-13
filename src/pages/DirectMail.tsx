import { useState, useEffect } from 'react';
import { KPICard } from '../components/KPICard';
import { DataTable, type Column } from '../components/DataTable';
import { PeriodSelector } from '../components/PeriodSelector';
import { dashboard } from '../lib/api';
import { formatCurrency, formatCurrencyDetailed, formatCompact, formatPct } from '../lib/formatters';
import type { DirectMailAppeal, ReportingPeriod } from '../lib/types';
import { DollarSign, Gift, TrendingUp, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_PALETTE } from '../lib/chartColors';

function sum(arr: DirectMailAppeal[], key: keyof DirectMailAppeal): number {
  return arr.reduce((s, a) => s + (Number(a[key]) || 0), 0);
}

function YoYRow({ label, current, previous, format }: { label: string; current: number; previous: number; format: (n: number) => string }) {
  const delta = previous > 0 ? ((current - previous) / previous) * 100 : null;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600 w-36">{label}</span>
      <span className="text-sm text-gray-400 w-28 text-right">{format(previous)}</span>
      <ArrowRight size={14} className="text-gray-300 mx-2" />
      <span className="text-sm font-semibold w-28 text-right">{format(current)}</span>
      {delta != null ? (
        <span className={`text-sm font-medium w-20 text-right ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-gray-400'}`}>
          {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
        </span>
      ) : (
        <span className="text-sm text-gray-300 w-20 text-right">--</span>
      )}
    </div>
  );
}

export function DirectMail() {
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [, setPeriod] = useState<ReportingPeriod | null>(null);
  const [appeals, setAppeals] = useState<DirectMailAppeal[]>([]);
  const [yoyAppeals, setYoyAppeals] = useState<DirectMailAppeal[]>([]);
  const [yoyPeriodLabel, setYoyPeriodLabel] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!periodId) return;
    setLoading(true);
    dashboard.mail(periodId)
      .then(r => {
        setAppeals(r.appeals);
        setYoyAppeals((r as { yoy?: { appeals: DirectMailAppeal[]; periodLabel: string } }).yoy?.appeals || []);
        setYoyPeriodLabel((r as { yoy?: { appeals: DirectMailAppeal[]; periodLabel: string } }).yoy?.periodLabel || '');
      })
      .catch(() => { setAppeals([]); setYoyAppeals([]); })
      .finally(() => setLoading(false));
  }, [periodId]);

  const totalGiven = sum(appeals, 'total_given');
  const totalGifts = sum(appeals, 'gifts');
  const totalDonors = sum(appeals, 'donors');
  const totalCost = sum(appeals, 'total_cost');
  const profitLoss = sum(appeals, 'profit_loss');
  const avgPerGift = totalGifts > 0 ? totalGiven / totalGifts : 0;

  // YoY totals
  const prevGiven = sum(yoyAppeals, 'total_given');
  const prevGifts = sum(yoyAppeals, 'gifts');
  const prevCost = sum(yoyAppeals, 'total_cost');
  const prevProfit = sum(yoyAppeals, 'profit_loss');
  const prevAvgPerGift = prevGifts > 0 ? prevGiven / prevGifts : 0;
  const givenDelta = prevGiven > 0 ? ((totalGiven - prevGiven) / prevGiven) * 100 : null;

  const chartData = appeals.map(a => ({
    name: a.appeal_id,
    'Total Given': a.total_given || 0,
    'Total Cost': a.total_cost || 0,
    'Profit': a.profit_loss || 0,
  }));

  // YoY bar chart comparing quarters side by side
  const yoyChartData = yoyAppeals.length > 0 ? [
    { name: yoyPeriodLabel, 'Total Given': prevGiven, Gifts: prevGifts, 'Avg/Gift': prevAvgPerGift },
    { name: 'Current', 'Total Given': totalGiven, Gifts: totalGifts, 'Avg/Gift': avgPerGift },
  ] : [];

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
            <KPICard label="Total Given" value={formatCurrency(totalGiven)} delta={givenDelta} deltaLabel="vs prior year" icon={DollarSign} color="green" />
            <KPICard label="Total Gifts" value={formatCompact(totalGifts)} icon={Gift} color="blue" />
            <KPICard label="Avg per Gift" value={formatCurrency(avgPerGift)} color="amber" />
            <KPICard label="Profit/Loss" value={formatCurrency(profitLoss)} icon={TrendingUp} color={profitLoss >= 0 ? 'green' : 'rose'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-sm space-y-2">
              <h3 className="font-semibold text-gray-700">Summary</h3>
              <div className="flex justify-between"><span className="text-gray-500">Appeals</span><span className="font-medium">{appeals.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Donors</span><span className="font-medium">{formatCompact(totalDonors)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Cost</span><span className="font-medium">{formatCurrency(totalCost)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Avg Response</span><span className="font-medium">{formatPct(totalGifts && sum(appeals, 'num_solicitors') ? (totalGifts / sum(appeals, 'num_solicitors')) * 100 : 0)}</span></div>
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

          {/* Year-over-Year Comparison */}
          {yoyAppeals.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Year-over-Year Comparison</h3>
                <p className="text-xs text-gray-400 mb-4">{yoyPeriodLabel} vs Current Quarter</p>
                <YoYRow label="Total Given" current={totalGiven} previous={prevGiven} format={formatCurrency} />
                <YoYRow label="Total Gifts" current={totalGifts} previous={prevGifts} format={formatCompact} />
                <YoYRow label="Avg per Gift" current={avgPerGift} previous={prevAvgPerGift} format={formatCurrency} />
                <YoYRow label="Total Cost" current={totalCost} previous={prevCost} format={formatCurrency} />
                <YoYRow label="Profit/Loss" current={profitLoss} previous={prevProfit} format={formatCurrency} />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">YoY: Total Given</h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yoyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Bar dataKey="Total Given" fill={CHART_PALETTE[0]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

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
