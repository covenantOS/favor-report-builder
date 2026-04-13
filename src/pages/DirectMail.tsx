import { useState, useEffect } from 'react';
import { PeriodSelector } from '../components/PeriodSelector';
import { dashboard } from '../lib/api';
import { formatCurrency, formatCurrencyDetailed, formatCompact, formatPct } from '../lib/formatters';
import type { DirectMailAppeal, ReportingPeriod } from '../lib/types';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CHART_PALETTE } from '../lib/chartColors';

function sum(arr: DirectMailAppeal[], key: keyof DirectMailAppeal): number {
  return arr.reduce((s, a) => s + (Number(a[key]) || 0), 0);
}

function StatRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex justify-between items-baseline py-1.5">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="text-right">
        <span className="text-sm font-semibold text-gray-900">{value}</span>
        {sub && <span className="text-xs text-gray-400 ml-1">{sub}</span>}
      </div>
    </div>
  );
}

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  if (!previous) return null;
  const pct = ((current - previous) / previous) * 100;
  const up = pct > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {up ? '+' : ''}{pct.toFixed(1)}%
    </span>
  );
}

export function DirectMail() {
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [period, setPeriod] = useState<ReportingPeriod | null>(null);
  const [appeals, setAppeals] = useState<DirectMailAppeal[]>([]);
  const [yoyAppeals, setYoyAppeals] = useState<DirectMailAppeal[]>([]);
  const [yoyLabel, setYoyLabel] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!periodId) return;
    setLoading(true);
    dashboard.mail(periodId)
      .then(r => {
        setAppeals(r.appeals);
        const yoy = (r as { yoy?: { appeals: DirectMailAppeal[]; periodLabel: string } }).yoy;
        setYoyAppeals(yoy?.appeals || []);
        setYoyLabel(yoy?.periodLabel || '');
      })
      .catch(() => { setAppeals([]); setYoyAppeals([]); })
      .finally(() => setLoading(false));
  }, [periodId]);

  // Current period totals
  const t = {
    sols: sum(appeals, 'num_solicitors'),
    gifts: sum(appeals, 'gifts'),
    donors: sum(appeals, 'donors'),
    given: sum(appeals, 'total_given'),
    cost: sum(appeals, 'total_cost'),
    pkg: sum(appeals, 'package_cost'),
    brm: sum(appeals, 'brm_returns_cost'),
    profit: sum(appeals, 'profit_loss'),
  };
  const avgGift = t.gifts > 0 ? t.given / t.gifts : 0;
  const respRate = t.sols > 0 ? (t.gifts / t.sols) * 100 : 0;
  const costPerDonor = t.donors > 0 ? t.cost / t.donors : 0;

  // YoY totals
  const p = {
    sols: sum(yoyAppeals, 'num_solicitors'),
    gifts: sum(yoyAppeals, 'gifts'),
    given: sum(yoyAppeals, 'total_given'),
    cost: sum(yoyAppeals, 'total_cost'),
    profit: sum(yoyAppeals, 'profit_loss'),
  };
  const pAvgGift = p.gifts > 0 ? p.given / p.gifts : 0;
  const pRespRate = p.sols > 0 ? (p.gifts / p.sols) * 100 : 0;

  const chartData = appeals.map(a => ({
    name: a.topic_audience || a.appeal_id,
    given: a.total_given || 0,
    cost: a.total_cost || 0,
    profit: a.profit_loss || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Direct Mail Appeals</h1>
          {period && <p className="text-sm text-gray-500">{period.label}</p>}
        </div>
        <PeriodSelector value={periodId} onChange={(id, p) => { setPeriodId(id); setPeriod(p); }} />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : !appeals.length ? (
        <div className="text-center py-20 text-gray-400">No direct mail data for this period.</div>
      ) : (
        <>
          {/* Grand Totals Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Revenue */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Revenue</h3>
              <div className="text-3xl font-bold text-emerald-700">{formatCurrency(t.given)}</div>
              {p.given > 0 && <div className="mt-1"><DeltaBadge current={t.given} previous={p.given} /> <span className="text-xs text-gray-400">vs {yoyLabel}</span></div>}
              <div className="mt-4 space-y-0.5 border-t border-gray-100 pt-3">
                <StatRow label="Total Gifts" value={formatCompact(t.gifts)} />
                <StatRow label="Total Donors" value={formatCompact(t.donors)} />
                <StatRow label="Avg per Gift" value={formatCurrencyDetailed(avgGift)} />
                <StatRow label="Solicitations Mailed" value={formatCompact(t.sols)} />
                <StatRow label="Response Rate" value={formatPct(respRate)} />
              </div>
            </div>

            {/* Costs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Cost Breakdown</h3>
              <div className="text-3xl font-bold text-gray-800">{formatCurrency(t.cost)}</div>
              {p.cost > 0 && <div className="mt-1"><DeltaBadge current={t.cost} previous={p.cost} /> <span className="text-xs text-gray-400">vs {yoyLabel}</span></div>}
              <div className="mt-4 space-y-0.5 border-t border-gray-100 pt-3">
                <StatRow label="Package / Print / Postage" value={formatCurrency(t.pkg)} />
                <StatRow label="BRM Returns" value={formatCurrency(t.brm)} sub={`${t.gifts} x $1.77`} />
                <StatRow label="Cost per Donor" value={formatCurrencyDetailed(costPerDonor)} />
                <StatRow label="Cost per Dollar Raised" value={t.given > 0 ? `$${(t.cost / t.given).toFixed(2)}` : '--'} />
              </div>
            </div>

            {/* Profit */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Profit / Loss</h3>
              <div className={`text-3xl font-bold ${t.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatCurrency(t.profit)}</div>
              {p.profit > 0 && <div className="mt-1"><DeltaBadge current={t.profit} previous={p.profit} /> <span className="text-xs text-gray-400">vs {yoyLabel}</span></div>}
              <div className="mt-4 space-y-0.5 border-t border-gray-100 pt-3">
                <StatRow label="ROI" value={t.cost > 0 ? `${((t.profit / t.cost) * 100).toFixed(1)}%` : '--'} />
                <StatRow label="Revenue" value={formatCurrency(t.given)} />
                <StatRow label="minus Total Cost" value={`(${formatCurrency(t.cost)})`} />
                <StatRow label="= Net Profit" value={formatCurrency(t.profit)} />
              </div>
            </div>
          </div>

          {/* Individual Appeal Breakdown - full table like the Excel */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Appeal Breakdown</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Appeal</th>
                  <th className="px-4 py-3 text-left">Topic / Audience</th>
                  <th className="px-3 py-3 text-right">Sols</th>
                  <th className="px-3 py-3 text-right">Gifts</th>
                  <th className="px-3 py-3 text-right">Donors</th>
                  <th className="px-3 py-3 text-right">% Resp</th>
                  <th className="px-3 py-3 text-right">Total Given</th>
                  <th className="px-3 py-3 text-right">Avg/Gift</th>
                  <th className="px-3 py-3 text-right">Pkg Cost</th>
                  <th className="px-3 py-3 text-right">BRM Cost</th>
                  <th className="px-3 py-3 text-right">Total Cost</th>
                  <th className="px-3 py-3 text-right">Profit/Loss</th>
                  <th className="px-3 py-3 text-right">Cost/Donor</th>
                </tr>
              </thead>
              <tbody>
                {appeals.map(a => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{a.appeal_id}</td>
                    <td className="px-4 py-3 text-gray-600">{a.topic_audience || a.description || '--'}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatCompact(a.num_solicitors)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatCompact(a.gifts)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatCompact(a.donors)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatPct(a.num_solicitors && a.gifts ? (a.gifts / a.num_solicitors) * 100 : a.response_pct)}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold text-emerald-700">{formatCurrency(a.total_given)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatCurrencyDetailed(a.avg_per_gift)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{a.package_cost ? formatCurrency(a.package_cost) : '--'}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{a.brm_returns_cost ? formatCurrencyDetailed(a.brm_returns_cost) : '--'}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(a.total_cost)}</td>
                    <td className={`px-3 py-3 text-right tabular-nums font-semibold ${(a.profit_loss || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {a.profit_loss != null ? formatCurrency(a.profit_loss) : '--'}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatCurrencyDetailed(a.cost_per_donor)}</td>
                  </tr>
                ))}
                {/* Grand Total Row */}
                <tr className="bg-gray-50 font-semibold border-t-2 border-gray-300">
                  <td className="px-4 py-3" colSpan={2}>GRAND TOTALS</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCompact(t.sols)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCompact(t.gifts)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCompact(t.donors)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatPct(respRate)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-emerald-700">{formatCurrency(t.given)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCurrencyDetailed(avgGift)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(t.pkg)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCurrencyDetailed(t.brm)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(t.cost)}</td>
                  <td className={`px-3 py-3 text-right tabular-nums ${t.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(t.profit)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCurrencyDetailed(costPerDonor)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Profit by Appeal Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue vs Cost by Appeal</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={2}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="given" name="Revenue" stackId="a" fill={CHART_PALETTE[0]} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="cost" name="Cost" fill="#ef4444" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="profit" name="Profit">
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={chartData[i].profit >= 0 ? '#059669' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* YoY Comparison */}
          {yoyAppeals.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700">Year-over-Year: {yoyLabel} vs {period?.label}</h3>
              <p className="text-xs text-gray-400 mb-4">Same quarter comparison</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      <th className="py-2 text-left">Metric</th>
                      <th className="py-2 text-right">{yoyLabel}</th>
                      <th className="py-2 text-center w-10"></th>
                      <th className="py-2 text-right">{period?.label}</th>
                      <th className="py-2 text-right">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { label: 'Total Given', curr: t.given, prev: p.given, fmt: formatCurrency },
                      { label: 'Total Gifts', curr: t.gifts, prev: p.gifts, fmt: formatCompact },
                      { label: 'Avg per Gift', curr: avgGift, prev: pAvgGift, fmt: formatCurrencyDetailed },
                      { label: 'Solicitations', curr: t.sols, prev: p.sols, fmt: formatCompact },
                      { label: 'Response Rate', curr: respRate, prev: pRespRate, fmt: (v: number) => formatPct(v) },
                      { label: 'Total Cost', curr: t.cost, prev: p.cost, fmt: formatCurrency },
                      { label: 'Profit/Loss', curr: t.profit, prev: p.profit, fmt: formatCurrency },
                    ].map(row => (
                      <tr key={row.label}>
                        <td className="py-2.5 text-gray-600">{row.label}</td>
                        <td className="py-2.5 text-right text-gray-400">{row.fmt(row.prev)}</td>
                        <td className="py-2.5 text-center"><ArrowRight size={12} className="text-gray-300 mx-auto" /></td>
                        <td className="py-2.5 text-right font-semibold">{row.fmt(row.curr)}</td>
                        <td className="py-2.5 text-right"><DeltaBadge current={row.curr} previous={row.prev} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
