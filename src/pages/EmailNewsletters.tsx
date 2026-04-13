import { useState, useEffect } from 'react';
import { KPICard } from '../components/KPICard';
import { DataTable, type Column } from '../components/DataTable';
import { PeriodSelector } from '../components/PeriodSelector';
import { dashboard } from '../lib/api';
import { formatCurrency, formatCompact, formatPct } from '../lib/formatters';
import type { EmailNewsletter, ReportingPeriod } from '../lib/types';
import { Mail, MousePointer, DollarSign, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_PALETTE } from '../lib/chartColors';

export function EmailNewsletters() {
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [, setPeriod] = useState<ReportingPeriod | null>(null);
  const [newsletters, setNewsletters] = useState<EmailNewsletter[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!periodId) return;
    setLoading(true);
    dashboard.email(periodId)
      .then(r => setNewsletters(r.newsletters))
      .catch(() => setNewsletters([]))
      .finally(() => setLoading(false));
  }, [periodId]);

  const originals = newsletters.filter(n => !n.is_resend);
  const resends = newsletters.filter(n => n.is_resend);

  const totalRecipients = originals.reduce((s, n) => s + (n.recipients || 0), 0);
  const totalOpens = originals.reduce((s, n) => s + (n.opens || 0), 0);
  const totalClicks = originals.reduce((s, n) => s + (n.clicks || 0), 0);
  const totalRaised = newsletters.reduce((s, n) => s + (n.total_raised || 0), 0);
  const avgOpenRate = totalRecipients > 0 ? (totalOpens / totalRecipients) * 100 : 0;
  const avgClickRate = totalRecipients > 0 ? (totalClicks / totalRecipients) * 100 : 0;

  const chartData = originals.map(n => ({
    name: n.subject_line?.substring(0, 25) || n.name.substring(0, 25),
    Opens: n.opens || 0,
    Clicks: n.clicks || 0,
  }));

  const columns: Column<EmailNewsletter>[] = [
    { key: 'subject_line', label: 'Subject', render: r => (
      <div>
        <div className="font-medium text-gray-900">{r.subject_line || r.name}</div>
        {r.is_resend && <span className="inline-block text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded mt-0.5">Resend</span>}
      </div>
    )},
    { key: 'date_sent', label: 'Sent', render: r => <span className="text-xs text-gray-500">{r.date_sent || '--'}</span> },
    { key: 'recipients', label: 'Recipients', align: 'right', render: r => formatCompact(r.recipients) },
    { key: 'opens', label: 'Opens', align: 'right', render: r => formatCompact(r.opens) },
    { key: 'open_rate', label: 'Open %', align: 'right', sortable: false, render: r => formatPct(r.recipients ? ((r.opens || 0) / r.recipients) * 100 : null) },
    { key: 'clicks', label: 'Clicks', align: 'right', render: r => formatCompact(r.clicks) },
    { key: 'transactions', label: 'Txns', align: 'right', render: r => String(r.transactions ?? '--') },
    { key: 'total_raised', label: 'Raised', align: 'right', render: r => r.total_raised ? formatCurrency(r.total_raised) : '--' },
    { key: 'bounces', label: 'Bounces', align: 'right' },
    { key: 'unsubscribes', label: 'Unsubs', align: 'right' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Email Newsletters</h1>
        <PeriodSelector value={periodId} onChange={(id, p) => { setPeriodId(id); setPeriod(p); }} />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : !newsletters.length ? (
        <div className="text-center py-20 text-gray-400">No email data for this period.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label="Avg Open Rate" value={formatPct(avgOpenRate)} icon={Mail} color="purple" />
            <KPICard label="Avg Click Rate" value={formatPct(avgClickRate)} icon={MousePointer} color="blue" />
            <KPICard label="Total Raised" value={formatCurrency(totalRaised)} icon={DollarSign} color="green" />
            <KPICard label="Newsletters Sent" value={`${originals.length} + ${resends.length} resends`} icon={Users} color="amber" />
          </div>

          {chartData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Opens vs Clicks (Originals)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Opens" fill={CHART_PALETTE[0]} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Clicks" fill={CHART_PALETTE[1]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">All Newsletters</h3>
            </div>
            <DataTable data={newsletters} columns={columns} keyField="id" />
          </div>
        </>
      )}
    </div>
  );
}
