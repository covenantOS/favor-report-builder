import { useState, useEffect } from 'react';
import { KPICard } from '../components/KPICard';
import { DataTable, type Column } from '../components/DataTable';
import { PeriodSelector } from '../components/PeriodSelector';
import { dashboard } from '../lib/api';
import { formatCurrency, formatCurrencyDetailed, formatCompact } from '../lib/formatters';
import type { DirectMailAppeal, ReportingPeriod } from '../lib/types';
import { DollarSign, Gift, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_PALETTE } from '../lib/chartColors';

function sum(arr: DirectMailAppeal[], key: keyof DirectMailAppeal): number {
  return arr.reduce((s, a) => s + (Number(a[key]) || 0), 0);
}

function YoYRow({ label, current, previous, format }: { label: string; current: number; previous: number; format: (n: number) => string }) {
  const delta = previous > 0 ? ((current - previous) / previous) * 100 : null;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600 flex-1">{label}</span>
      <span className="text-sm text-gray-400 w-24 text-right">{format(previous)}</span>
      <ArrowRight size={14} className="text-gray-300 mx-3 shrink-0" />
      <span className="text-sm font-semibold w-24 text-right">{format(current)}</span>
      {delta != null ? (
        <span className={`text-sm font-medium w-16 text-right ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-gray-400'}`}>
          {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
        </span>
      ) : (
        <span className="text-sm text-gray-300 w-16 text-right">--</span>
      )}
    </div>
  );
}

export function DirectMail() {
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [period, setPeriod] = useState<ReportingPeriod | null>(null);
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
  const avgPerGift = totalGifts > 0 ? totalGiven / totalGifts : 0;
  const hasCosts = totalCost > 0;

  // YoY
  const prevGiven = sum(yoyAppeals, 'total_given');
  const prevGifts = sum(yoyAppeals, 'gifts');
  const prevCost = sum(yoyAppeals, 'total_cost');
  const prevProfit = sum(yoyAppeals, 'profit_loss');
  const prevAvgPerGift = prevGifts > 0 ? prevGiven / prevGifts : 0;
  const givenDelta = prevGiven > 0 ? ((totalGiven - prevGiven) / prevGiven) * 100 : null;

  const chartData = appeals.map(a => ({
    name: a.topic_audience || a.appeal_id,
    'Total Given': a.total_given || 0,
    Gifts: a.gifts || 0,
  }));

  const columns: Column<DirectMailAppeal>[] = [
    { key: 'appeal_id', label: 'ID' },
    { key: 'topic_audience', label: 'Topic / Audience', render: r => <span className="font-medium">{r.topic_audience || r.description || '--'}</span> },
    { key: 'gifts', label: 'Gifts', align: 'right', render: r => formatCompact(r.gifts) },
    { key: 'donors', label: 'Donors', align: 'right', render: r => formatCompact(r.donors) },
    { key: 'total_given', label: 'Total Given', align: 'right', render: r => <span className="font-semibold text-emerald-700">{formatCurrency(r.total_given)}</span> },
    { key: 'avg_per_gift', label: 'Avg/Gift', align: 'right', render: r => formatCurrencyDetailed(r.avg_per_gift) },
    ...(hasCosts ? [
      { key: 'total_cost', label: 'Total Cost', align: 'right' as const, render: (r: DirectMailAppeal) => formatCurrency(r.total_cost) },
      { key: 'profit_loss', label: 'Profit/Loss', align: 'right' as const, render: (r: DirectMailAppeal) => {
        const v = r.profit_loss;
        if (v == null) return '--';
        return <span className={v >= 0 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>{formatCurrency(v)}</span>;
      }},
    ] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Direct Mail Appeals</h1>
          {period && <p className="text-gray-500 text-sm mt-0.5">{period.label}</p>}
        </div>
        <PeriodSelector value={periodId} onChange={(id, p) => { setPeriodId(id); setPeriod(p); }} />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : !appeals.length ? (
        <div className="text-center py-20 text-gray-400">No direct mail data for this period.</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label="Total Given" value={formatCurrency(totalGiven)} delta={givenDelta} deltaLabel="vs prior year" icon={DollarSign} color="green" />
            <KPICard label="Total Gifts" value={formatCompact(totalGifts)} icon={Gift} color="blue" />
            <KPICard label="Avg per Gift" value={formatCurrencyDetailed(avgPerGift)} color="amber" />
            <KPICard label="Total Donors" value={formatCompact(totalDonors)} icon={TrendingUp} color="purple" />
          </div>

          {/* Missing data notice */}
          {!hasCosts && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Cost data not yet provided for this period</p>
                <p className="text-amber-600 mt-0.5">Solicitor counts, package costs, and BRM returns need to be provided to calculate profit/loss and response rates.</p>
              </div>
            </div>
          )}

          {/* Appeal comparison chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Giving by Appeal</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number, name: string) => [name === 'Total Given' ? formatCurrency(v) : v, name]} />
                  <Bar dataKey="Total Given" fill={CHART_PALETTE[0]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* YoY Comparison */}
          {yoyAppeals.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Year-over-Year: {yoyPeriodLabel} vs {period?.label}</h3>
              <p className="text-xs text-gray-400 mb-4">Comparing same quarter, prior year</p>
              <div className="max-w-lg">
                <YoYRow label="Total Given" current={totalGiven} previous={prevGiven} format={formatCurrency} />
                <YoYRow label="Total Gifts" current={totalGifts} previous={prevGifts} format={formatCompact} />
                <YoYRow label="Avg per Gift" current={avgPerGift} previous={prevAvgPerGift} format={(v) => formatCurrencyDetailed(v)} />
                {prevCost > 0 && <YoYRow label="Total Cost" current={totalCost} previous={prevCost} format={formatCurrency} />}
                {prevProfit > 0 && <YoYRow label="Profit/Loss" current={sum(appeals, 'profit_loss')} previous={prevProfit} format={formatCurrency} />}
              </div>
            </div>
          )}

          {/* Appeals table */}
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
