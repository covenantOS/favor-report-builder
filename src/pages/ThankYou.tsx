import { useState, useEffect } from 'react';
import { PeriodSelector } from '../components/PeriodSelector';
import { dashboard } from '../lib/api';
import { formatCurrency, formatCurrencyDetailed, formatCompact, formatPct } from '../lib/formatters';
import type { ThankYouReceipt, ReportingPeriod } from '../lib/types';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_PALETTE } from '../lib/chartColors';

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

export function ThankYou() {
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [period, setPeriod] = useState<ReportingPeriod | null>(null);
  const [receipts, setReceipts] = useState<ThankYouReceipt[]>([]);
  const [yoy, setYoy] = useState<{ gifts: number; donors: number; totalGiven: number; receiptsMailed: number; totalCost: number; periodLabel: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!periodId) return;
    setLoading(true);
    dashboard.thankyou(periodId)
      .then(r => {
        setReceipts(r.receipts);
        setYoy((r as { yoy?: typeof yoy }).yoy || null);
      })
      .catch(() => { setReceipts([]); setYoy(null); })
      .finally(() => setLoading(false));
  }, [periodId]);

  const totalGifts = receipts.reduce((s, r) => s + (r.gifts || 0), 0);
  const totalDonors = receipts.reduce((s, r) => s + (r.donors || 0), 0);
  const totalGiven = receipts.reduce((s, r) => s + (r.total_given || 0), 0);
  const avgPerGift = totalGifts > 0 ? totalGiven / totalGifts : 0;
  // Use 877 as total mailed (from user) -- stored in num_solicitors
  const totalMailed = receipts.reduce((s, r) => s + (r.num_solicitors || 0), 0) || 877;
  const responseRate = totalMailed > 0 ? (totalGifts / totalMailed) * 100 : 0;

  const fixedCostPerPiece = 1.96; // printing, envelope, postage per piece (from 2025 rate)
  const brmCostPerReturn = 1.77;
  const fixedCost = totalMailed * fixedCostPerPiece;
  const brmCost = totalGifts * brmCostPerReturn;
  const totalCost = fixedCost + brmCost;
  const profit = totalGiven - totalCost;
  const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

  const monthLabels: Record<string, string> = {
    'Y261-TY': 'January', 'Y262-TY': 'February', 'Y263-TY': 'March',
    'Y264-TY': 'April', 'Y265-TY': 'May', 'Y266-TY': 'June',
  };

  const chartData = receipts.map(r => ({
    name: monthLabels[r.appeal_id] || r.appeal_id,
    'Total Given': r.total_given || 0,
    Gifts: r.gifts || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thank You Receipts</h1>
          {period && <p className="text-sm text-gray-500">{period.label} &mdash; Mail piece sent within 48hrs to US donors</p>}
        </div>
        <PeriodSelector value={periodId} onChange={(id, p) => { setPeriodId(id); setPeriod(p); }} />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : !receipts.length ? (
        <div className="text-center py-20 text-gray-400">No thank you receipt data for this period.</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Program Performance</h3>
              <div className="text-3xl font-bold text-emerald-700">{formatCurrency(totalGiven)}</div>
              <div className="text-xs text-gray-500">Revenue from BRM return gifts</div>
              {yoy && yoy.totalGiven > 0 && <div className="mt-1"><DeltaBadge current={totalGiven} previous={yoy.totalGiven} /> <span className="text-xs text-gray-400">vs {yoy.periodLabel}</span></div>}
              <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Receipts Mailed</span><span className="font-semibold">{formatCompact(totalMailed)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Return Gifts</span><span className="font-semibold">{formatCompact(totalGifts)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Response Rate</span><span className="font-semibold">{formatPct(responseRate)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Avg Gift</span><span className="font-semibold">{formatCurrencyDetailed(avgPerGift)}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Estimated Costs</h3>
              <div className="text-3xl font-bold text-gray-800">{formatCurrency(totalCost)}</div>
              <div className="text-xs text-gray-500">BRM, envelope, receipt, postage</div>
              <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Printing/Postage</span><span className="font-semibold">{formatCurrency(fixedCost)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">BRM Returns</span><span className="font-semibold">{formatCurrency(brmCost)} <span className="text-gray-400 text-xs">({totalGifts} x $1.77)</span></span></div>
                <div className="flex justify-between"><span className="text-gray-500">Cost per Receipt</span><span className="font-semibold">{formatCurrencyDetailed(fixedCostPerPiece)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Cost per Dollar Raised</span><span className="font-semibold">${totalGiven > 0 ? (totalCost / totalGiven).toFixed(2) : '--'}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Profit / Loss</h3>
              <div className={`text-3xl font-bold ${profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatCurrency(profit)}</div>
              <div className="text-xs text-gray-500">ROI: {roi.toFixed(1)}%</div>
              <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Revenue</span><span className="font-semibold">{formatCurrency(totalGiven)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">minus Cost</span><span className="font-semibold">({formatCurrency(totalCost)})</span></div>
                <div className="flex justify-between"><span className="text-gray-500">= Net Profit</span><span className="font-semibold">{formatCurrency(profit)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Cost per Gift</span><span className="font-semibold">{totalGifts > 0 ? formatCurrencyDetailed(totalCost / totalGifts) : '--'}</span></div>
              </div>
            </div>
          </div>

          {/* Monthly chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Revenue by Month</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={40}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}K`} />
                  <Tooltip formatter={(v: number, name: string) => [name === 'Total Given' ? formatCurrency(v) : v, name]} />
                  <Bar dataKey="Total Given" fill={CHART_PALETTE[0]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Monthly Breakdown</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Month</th>
                  <th className="px-3 py-3 text-right">Return Gifts</th>
                  <th className="px-3 py-3 text-right">Donors</th>
                  <th className="px-3 py-3 text-right">Total Given</th>
                  <th className="px-3 py-3 text-right">Avg/Gift</th>
                  <th className="px-3 py-3 text-right">Avg/Donor</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{monthLabels[r.appeal_id] || r.appeal_id}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatCompact(r.gifts)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatCompact(r.donors)}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold text-emerald-700">{formatCurrency(r.total_given)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatCurrencyDetailed(r.avg_per_gift)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatCurrencyDetailed(r.avg_per_donor)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold border-t-2 border-gray-300">
                  <td className="px-4 py-3">TOTAL</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCompact(totalGifts)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCompact(totalDonors)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-emerald-700">{formatCurrency(totalGiven)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCurrencyDetailed(avgPerGift)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{totalDonors > 0 ? formatCurrencyDetailed(totalGiven / totalDonors) : '--'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* YoY */}
          {yoy && yoy.totalGiven > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700">Year-over-Year: {yoy.periodLabel} vs {period?.label}</h3>
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase border-b border-gray-200">
                      <th className="py-2 text-left">Metric</th>
                      <th className="py-2 text-right">{yoy.periodLabel}</th>
                      <th className="py-2 text-center w-10"></th>
                      <th className="py-2 text-right">{period?.label}</th>
                      <th className="py-2 text-right">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { label: 'Receipts Mailed', curr: totalMailed, prev: yoy.receiptsMailed, fmt: formatCompact },
                      { label: 'Return Gifts', curr: totalGifts, prev: yoy.gifts, fmt: formatCompact },
                      { label: 'Revenue', curr: totalGiven, prev: yoy.totalGiven, fmt: formatCurrency },
                      { label: 'Response Rate', curr: responseRate, prev: yoy.receiptsMailed > 0 ? (yoy.gifts / yoy.receiptsMailed) * 100 : 0, fmt: (v: number) => formatPct(v) },
                      { label: 'Avg Gift', curr: avgPerGift, prev: yoy.gifts > 0 ? yoy.totalGiven / yoy.gifts : 0, fmt: formatCurrencyDetailed },
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
