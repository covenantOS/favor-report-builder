import { useState, useEffect } from 'react';
import { KPICard } from '../components/KPICard';
import { DataTable, type Column } from '../components/DataTable';
import { PeriodSelector } from '../components/PeriodSelector';
import { dashboard, accounts as accountsApi } from '../lib/api';
import { formatCompact, formatPct } from '../lib/formatters';
import type { SocialAccount, SocialMetrics, SocialTopContent, SocialDemographic, ReportingPeriod } from '../lib/types';
import { Users, Eye, Heart, MousePointer } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { CHART_PALETTE, PLATFORM_COLORS } from '../lib/chartColors';

export function SocialMedia() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [, setPeriod] = useState<ReportingPeriod | null>(null);
  const [metrics, setMetrics] = useState<SocialMetrics | null>(null);
  const [topContent, setTopContent] = useState<SocialTopContent[]>([]);
  const [demographics, setDemographics] = useState<SocialDemographic[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    accountsApi.list().then(r => {
      setAccounts(r.accounts);
      if (r.accounts.length) setAccountId(r.accounts[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!accountId || !periodId) return;
    setLoading(true);
    dashboard.social(accountId, periodId)
      .then(r => { setMetrics(r.metrics); setTopContent(r.topContent); setDemographics(r.demographics); })
      .catch(() => { setMetrics(null); setTopContent([]); setDemographics([]); })
      .finally(() => setLoading(false));
  }, [accountId, periodId]);

  const account = accounts.find(a => a.id === accountId);
  const viewsByType = metrics?.views_by_content_type
    ? Object.entries(metrics.views_by_content_type).map(([k, v]) => ({ name: k, value: v }))
    : [];

  const interactionData = metrics ? [
    { name: 'Likes', value: metrics.likes || 0 },
    { name: 'Comments', value: metrics.comments || 0 },
    { name: 'Saves', value: metrics.saves || 0 },
    { name: 'Shares', value: metrics.shares || 0 },
    { name: 'Reposts', value: metrics.reposts || 0 },
  ].filter(d => d.value > 0) : [];

  const ageData = demographics.filter(d => d.demo_type === 'age_range').sort((a, b) => a.demo_value.localeCompare(b.demo_value));
  const countryData = demographics.filter(d => d.demo_type === 'country').sort((a, b) => (b.percentage || 0) - (a.percentage || 0));

  const contentColumns: Column<SocialTopContent>[] = [
    { key: 'rank_position', label: '#', align: 'center' },
    { key: 'content_title', label: 'Content' },
    { key: 'content_type', label: 'Type' },
    { key: 'metric_value', label: 'Views', align: 'right', render: (r) => formatCompact(r.metric_value) },
    { key: 'content_date', label: 'Date' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Social Media</h1>
        </div>
        <select
          value={accountId || ''}
          onChange={e => setAccountId(parseInt(e.target.value))}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium"
        >
          {accounts.map(a => (
            <option key={a.id} value={a.id}>
              {a.account_name} - {a.platform.charAt(0).toUpperCase() + a.platform.slice(1)}
            </option>
          ))}
        </select>
        <PeriodSelector value={periodId} onChange={(id, p) => { setPeriodId(id); setPeriod(p); }} />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : !metrics ? (
        <div className="text-center py-20 text-gray-400">No social data for this selection.</div>
      ) : (
        <>
          {/* Platform badge */}
          {account && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white" style={{ backgroundColor: PLATFORM_COLORS[account.platform] || '#666' }}>
              {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)} - {account.account_name}
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label="Total Views" value={formatCompact(metrics.total_views)} delta={metrics.views_change_pct} icon={Eye} color="blue" />
            <KPICard label="Interactions" value={formatCompact(metrics.total_interactions)} icon={Heart} color="green" />
            <KPICard label="Followers" value={formatCompact(metrics.total_followers)} delta={metrics.followers_change_pct} icon={Users} color="purple" />
            <KPICard label="Profile Activity" value={formatCompact(metrics.total_profile_activity)} delta={metrics.profile_activity_change_pct} icon={MousePointer} color="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Views by content type */}
            {viewsByType.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Views by Content Type</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={viewsByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}%`}>
                        {viewsByType.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Interaction breakdown */}
            {interactionData.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Interaction Breakdown</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={interactionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                      <Tooltip />
                      <Bar dataKey="value" fill={CHART_PALETTE[1]} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Follower & audience */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Follower Metrics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Net Growth:</span> <span className="font-semibold">{metrics.net_follower_growth ?? '--'}</span></div>
                <div><span className="text-gray-500">New Follows:</span> <span className="font-semibold">{metrics.new_follows ?? '--'}</span></div>
                <div><span className="text-gray-500">Unfollows:</span> <span className="font-semibold">{metrics.unfollows ?? '--'}</span></div>
                <div><span className="text-gray-500">Follower Views:</span> <span className="font-semibold">{formatPct(metrics.follower_views_pct)}</span></div>
                <div><span className="text-gray-500">Non-Follower Views:</span> <span className="font-semibold">{formatPct(metrics.non_follower_views_pct)}</span></div>
                {metrics.gender_male_pct != null && (
                  <>
                    <div><span className="text-gray-500">Male:</span> <span className="font-semibold">{formatPct(metrics.gender_male_pct)}</span></div>
                    <div><span className="text-gray-500">Female:</span> <span className="font-semibold">{formatPct(metrics.gender_female_pct)}</span></div>
                  </>
                )}
              </div>
            </div>

            {/* Age demographics */}
            {ageData.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Audience by Age</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="demo_value" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => `${v}%`} />
                      <Legend />
                      <Bar dataKey="percentage" name="All" fill={CHART_PALETTE[0]} radius={[4, 4, 0, 0]} />
                      {ageData[0]?.male_pct != null && <Bar dataKey="male_pct" name="Men" fill={CHART_PALETTE[2]} radius={[4, 4, 0, 0]} />}
                      {ageData[0]?.female_pct != null && <Bar dataKey="female_pct" name="Women" fill={CHART_PALETTE[4]} radius={[4, 4, 0, 0]} />}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Top countries */}
          {countryData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Countries</h3>
              <div className="flex flex-wrap gap-3">
                {countryData.slice(0, 8).map(c => (
                  <div key={c.demo_value} className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
                    <span className="font-medium">{c.demo_value}</span>
                    <span className="text-gray-400 ml-1.5">{formatPct(c.percentage)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top content table */}
          {topContent.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Content</h3>
              <DataTable data={topContent} columns={contentColumns} keyField="id" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
