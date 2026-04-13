import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, DollarSign, Mail, Heart, Share2, Newspaper, ArrowRight, Eye, MousePointer } from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { PeriodSelector } from '../components/PeriodSelector';
import { dashboard } from '../lib/api';
import { formatCurrency, formatCompact, formatPct } from '../lib/formatters';
import type { DashboardSummary, ReportingPeriod } from '../lib/types';

function SectionHeader({ icon: Icon, color, title, to }: { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; title: string; to: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={18} className={color} />
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <Link to={to} className="ml-auto text-sm text-primary hover:underline flex items-center gap-1">
        View details <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export function Dashboard() {
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [period, setPeriod] = useState<ReportingPeriod | null>(null);
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

  const hasData = summary && (
    summary.social.totalFollowers > 0 ||
    summary.mail.totalGiven > 0 ||
    summary.email.totalRaised > 0 ||
    summary.thankyou.totalGiven > 0
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {period ? `Favor International - ${period.label}` : 'Overview of all Favor International metrics'}
          </p>
        </div>
        <PeriodSelector value={periodId} onChange={(id, p) => { setPeriodId(id); setPeriod(p); }} />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading dashboard...</div>
      ) : !hasData ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-500 text-lg">No data available for {period?.label || 'this period'}.</p>
          <p className="text-gray-400 text-sm mt-2">Select a different period above, or data needs to be loaded for this period.</p>
        </div>
      ) : (
        <>
          {/* Social Media */}
          {summary!.social.totalFollowers > 0 && (
            <section>
              <SectionHeader icon={Share2} color="text-blue-600" title="Social Media" to="/social" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard label="Total Followers" value={formatCompact(summary!.social.totalFollowers)} icon={Users} color="blue" />
                <KPICard label="Total Views" value={formatCompact(summary!.social.totalViews)} icon={Eye} color="purple" />
                <KPICard label="Total Interactions" value={formatCompact(summary!.social.totalInteractions)} icon={MousePointer} color="green" />
                <KPICard label="Follower Growth" value={`+${formatCompact(summary!.social.followerGrowth)}`} icon={Users} color="amber" />
              </div>
            </section>
          )}

          {/* Direct Mail */}
          {summary!.mail.totalGiven > 0 && (
            <section>
              <SectionHeader icon={Mail} color="text-emerald-600" title="Direct Mail Appeals" to="/mail" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard label="Total Given" value={formatCurrency(summary!.mail.totalGiven)} icon={DollarSign} color="green" />
                <KPICard label="Total Gifts" value={formatCompact(summary!.mail.totalGifts)} color="blue" />
                <KPICard label="Avg per Gift" value={formatCurrency(summary!.mail.avgPerGift)} color="amber" />
                <KPICard label="Appeals Sent" value={String(summary!.mail.totalAppeals)} icon={Mail} color="purple" />
              </div>
            </section>
          )}

          {/* Email */}
          {summary!.email.totalSent > 0 && (
            <section>
              <SectionHeader icon={Newspaper} color="text-purple-600" title="Email Newsletters" to="/email" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard label="Avg Open Rate" value={formatPct(summary!.email.avgOpenRate)} icon={Newspaper} color="purple" />
                <KPICard label="Avg Click Rate" value={formatPct(summary!.email.avgClickRate)} icon={MousePointer} color="blue" />
                <KPICard label="Total Raised" value={formatCurrency(summary!.email.totalRaised)} icon={DollarSign} color="green" />
                <KPICard label="Total Recipients" value={formatCompact(summary!.email.totalSent)} icon={Users} color="amber" />
              </div>
            </section>
          )}

          {/* Thank You */}
          {summary!.thankyou.totalGiven > 0 && (
            <section>
              <SectionHeader icon={Heart} color="text-rose-600" title="Thank You Receipts" to="/thankyou" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard label="Total Gifts" value={formatCompact(summary!.thankyou.totalGifts)} icon={Heart} color="rose" />
                <KPICard label="Total Donors" value={formatCompact(summary!.thankyou.totalDonors)} icon={Users} color="blue" />
                <KPICard label="Total Given" value={formatCurrency(summary!.thankyou.totalGiven)} icon={DollarSign} color="green" />
                <KPICard label="Avg per Gift" value={formatCurrency(summary!.thankyou.avgPerGift)} color="amber" />
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
