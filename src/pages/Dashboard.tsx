import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, DollarSign, Mail, Heart, Share2, Newspaper, ArrowRight } from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { PeriodSelector } from '../components/PeriodSelector';
import { dashboard } from '../lib/api';
import { formatCurrency, formatCompact, formatPct } from '../lib/formatters';
import type { DashboardSummary, ReportingPeriod } from '../lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_PALETTE } from '../lib/chartColors';

export function Dashboard() {
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [, setPeriod] = useState<ReportingPeriod | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!periodId) return;
    setLoading(true);
    dashboard.summary(periodId)
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [periodId]);

  const mailChartData = summary ? [
    { name: 'Total Given', value: summary.mail.totalGiven },
    { name: 'Avg/Gift', value: summary.mail.avgPerGift },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Overview of all Favor International metrics</p>
        </div>
        <PeriodSelector value={periodId} onChange={(id, p) => { setPeriodId(id); setPeriod(p); }} />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading dashboard...</div>
      ) : !summary ? (
        <div className="text-center py-20 text-gray-400">No data available for this period. Upload data to get started.</div>
      ) : (
        <>
          {/* Social Media KPIs */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Share2 size={18} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Social Media</h2>
              <Link to="/social" className="ml-auto text-sm text-primary hover:underline flex items-center gap-1">
                View details <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard label="Total Followers" value={formatCompact(summary.social.totalFollowers)} icon={Users} color="blue" />
              <KPICard label="Total Views" value={formatCompact(summary.social.totalViews)} icon={Share2} color="purple" />
              <KPICard label="Total Interactions" value={formatCompact(summary.social.totalInteractions)} color="green" />
              <KPICard label="Follower Growth" value={formatCompact(summary.social.followerGrowth)} delta={summary.social.followerGrowth > 0 ? summary.social.followerGrowth : undefined} color="amber" />
            </div>
          </section>

          {/* Direct Mail KPIs */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Mail size={18} className="text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-800">Direct Mail Appeals</h2>
              <Link to="/mail" className="ml-auto text-sm text-primary hover:underline flex items-center gap-1">
                View details <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard label="Total Given" value={formatCurrency(summary.mail.totalGiven)} icon={DollarSign} color="green" />
              <KPICard label="Total Gifts" value={formatCompact(summary.mail.totalGifts)} color="blue" />
              <KPICard label="Avg per Gift" value={formatCurrency(summary.mail.avgPerGift)} color="amber" />
              <KPICard label="Appeals" value={String(summary.mail.totalAppeals)} color="purple" />
            </div>
            {summary.mail.totalGiven > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mailChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="value" fill={CHART_PALETTE[0]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* Email KPIs */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Newspaper size={18} className="text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800">Email Newsletters</h2>
              <Link to="/email" className="ml-auto text-sm text-primary hover:underline flex items-center gap-1">
                View details <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard label="Avg Open Rate" value={formatPct(summary.email.avgOpenRate)} color="purple" />
              <KPICard label="Avg Click Rate" value={formatPct(summary.email.avgClickRate)} color="blue" />
              <KPICard label="Total Raised" value={formatCurrency(summary.email.totalRaised)} icon={DollarSign} color="green" />
              <KPICard label="Emails Sent" value={formatCompact(summary.email.totalSent)} icon={Newspaper} color="amber" />
            </div>
          </section>

          {/* Thank You KPIs */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Heart size={18} className="text-rose-600" />
              <h2 className="text-lg font-semibold text-gray-800">Thank You Receipts</h2>
              <Link to="/thankyou" className="ml-auto text-sm text-primary hover:underline flex items-center gap-1">
                View details <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard label="Total Gifts" value={formatCompact(summary.thankyou.totalGifts)} icon={Heart} color="rose" />
              <KPICard label="Total Donors" value={formatCompact(summary.thankyou.totalDonors)} icon={Users} color="blue" />
              <KPICard label="Total Given" value={formatCurrency(summary.thankyou.totalGiven)} icon={DollarSign} color="green" />
              <KPICard label="Avg per Gift" value={formatCurrency(summary.thankyou.avgPerGift)} color="amber" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
