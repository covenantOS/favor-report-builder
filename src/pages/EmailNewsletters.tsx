import { useState, useEffect } from 'react';
import { PeriodSelector } from '../components/PeriodSelector';
import { dashboard } from '../lib/api';
import { formatCurrency, formatCompact, formatPct, formatNumber } from '../lib/formatters';
import type { EmailNewsletter, ReportingPeriod } from '../lib/types';
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

export function EmailNewsletters() {
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [period, setPeriod] = useState<ReportingPeriod | null>(null);
  const [newsletters, setNewsletters] = useState<EmailNewsletter[]>([]);
  const [yoy, setYoy] = useState<{ recipients: number; opens: number; clicks: number; totalRaised: number; gifts: number; periodLabel: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!periodId) return;
    setLoading(true);
    dashboard.email(periodId)
      .then(r => {
        setNewsletters(r.newsletters);
        setYoy((r as { yoy?: typeof yoy }).yoy || null);
      })
      .catch(() => { setNewsletters([]); setYoy(null); })
      .finally(() => setLoading(false));
  }, [periodId]);

  const originals = newsletters.filter(n => !n.is_resend);
  const resends = newsletters.filter(n => n.is_resend);

  const totalRecipients = originals.reduce((s, n) => s + (n.recipients || 0), 0);
  const totalOpens = originals.reduce((s, n) => s + (n.opens || 0), 0);
  const totalClicks = originals.reduce((s, n) => s + (n.clicks || 0), 0);
  const totalTxns = newsletters.reduce((s, n) => s + (n.transactions || 0), 0);
  const totalRaised = newsletters.reduce((s, n) => s + (n.total_raised || 0), 0);
  const totalBounces = originals.reduce((s, n) => s + (n.bounces || 0), 0);
  const totalUnsubs = originals.reduce((s, n) => s + (n.unsubscribes || 0), 0);
  const openRate = totalRecipients > 0 ? (totalOpens / totalRecipients) * 100 : 0;
  const clickRate = totalRecipients > 0 ? (totalClicks / totalRecipients) * 100 : 0;
  const unsubRate = totalRecipients > 0 ? (totalUnsubs / totalRecipients) * 100 : 0;
  const revPer1K = totalRecipients > 0 ? (totalRaised / totalRecipients) * 1000 : 0;

  const chartData = originals.map(n => ({
    name: (n.subject_line || n.name).substring(0, 20),
    Opens: n.opens || 0,
    Clicks: (n.clicks || 0) * 10, // scale up for visibility
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Newsletters</h1>
          {period && <p className="text-sm text-gray-500">{period.label}</p>}
        </div>
        <PeriodSelector value={periodId} onChange={(id, p) => { setPeriodId(id); setPeriod(p); }} />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : !newsletters.length ? (
        <div className="text-center py-20 text-gray-400">No email data for this period.</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Engagement</h3>
              <div className="text-3xl font-bold text-primary">{formatPct(openRate)}</div>
              <div className="text-xs text-gray-500">Open Rate (industry avg: 28.6%)</div>
              {yoy && yoy.recipients > 0 && (
                <div className="mt-1">
                  <DeltaBadge current={openRate} previous={(yoy.opens / yoy.recipients) * 100} />
                  <span className="text-xs text-gray-400 ml-1">vs {yoy.periodLabel}</span>
                </div>
              )}
              <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Total Opens</span><span className="font-semibold">{formatCompact(totalOpens)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Click Rate</span><span className="font-semibold">{formatPct(clickRate)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Total Clicks</span><span className="font-semibold">{formatCompact(totalClicks)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Rev per 1,000 Emails</span><span className="font-semibold">{formatCurrency(revPer1K)}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Revenue</h3>
              <div className="text-3xl font-bold text-emerald-700">{formatCurrency(totalRaised)}</div>
              <div className="text-xs text-gray-500">{totalTxns} transactions</div>
              {yoy && <div className="mt-1"><DeltaBadge current={totalRaised} previous={yoy.totalRaised} /> <span className="text-xs text-gray-400">vs {yoy.periodLabel}</span></div>}
              <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Avg Gift</span><span className="font-semibold">{totalTxns > 0 ? formatCurrency(totalRaised / totalTxns) : '--'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Originals</span><span className="font-semibold">{originals.length} sends</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Resends</span><span className="font-semibold">{resends.length} sends</span></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">List Health</h3>
              <div className="text-3xl font-bold text-gray-800">{formatCompact(totalRecipients)}</div>
              <div className="text-xs text-gray-500">Total Recipients (originals)</div>
              <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Bounces</span><span className="font-semibold">{formatNumber(totalBounces)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Unsubscribes</span><span className="font-semibold">{formatNumber(totalUnsubs)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Unsub Rate</span><span className="font-semibold">{formatPct(unsubRate, 3)}</span></div>
              </div>
            </div>
          </div>

          {/* Opens chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Opens by Newsletter (Originals)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={20}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="Opens" fill={CHART_PALETTE[0]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* YoY */}
          {yoy && yoy.recipients > 0 && (
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
                      { label: 'Total Recipients', curr: totalRecipients, prev: yoy.recipients, fmt: formatCompact },
                      { label: 'Total Opens', curr: totalOpens, prev: yoy.opens, fmt: formatCompact },
                      { label: 'Open Rate', curr: openRate, prev: (yoy.opens / yoy.recipients) * 100, fmt: (v: number) => formatPct(v) },
                      { label: 'Total Clicks', curr: totalClicks, prev: yoy.clicks, fmt: formatCompact },
                      { label: 'Total Raised', curr: totalRaised, prev: yoy.totalRaised, fmt: formatCurrency },
                      { label: 'Total Gifts', curr: totalTxns, prev: yoy.gifts, fmt: formatCompact },
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

          {/* Full newsletter table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">All Newsletters</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-3 py-3 text-left">Date</th>
                  <th className="px-3 py-3 text-center">Type</th>
                  <th className="px-3 py-3 text-right">Recipients</th>
                  <th className="px-3 py-3 text-right">Opens</th>
                  <th className="px-3 py-3 text-right">Open %</th>
                  <th className="px-3 py-3 text-right">Clicks</th>
                  <th className="px-3 py-3 text-right">Txns</th>
                  <th className="px-3 py-3 text-right">Raised</th>
                  <th className="px-3 py-3 text-right">Bounces</th>
                  <th className="px-3 py-3 text-right">Unsubs</th>
                </tr>
              </thead>
              <tbody>
                {newsletters.map(n => (
                  <tr key={n.id} className={`border-b border-gray-100 hover:bg-gray-50 ${n.is_resend ? 'bg-gray-50/50' : ''}`}>
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-gray-900 truncate max-w-xs">{n.subject_line || n.name}</div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs whitespace-nowrap">{n.date_sent}</td>
                    <td className="px-3 py-2.5 text-center">
                      {n.is_resend
                        ? <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Resend</span>
                        : <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Original</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{formatCompact(n.recipients)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{formatCompact(n.opens)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{n.recipients ? formatPct(((n.opens || 0) / n.recipients) * 100) : '--'}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{formatNumber(n.clicks)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{n.transactions || '--'}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-medium text-emerald-700">{n.total_raised ? formatCurrency(n.total_raised) : '--'}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-gray-400">{n.bounces || '--'}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-gray-400">{n.unsubscribes || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
