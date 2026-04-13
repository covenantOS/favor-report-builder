import { useState, useEffect } from 'react';
import { PeriodSelector } from '../components/PeriodSelector';
import { dashboard, accounts as accountsApi } from '../lib/api';
import { formatCompact, formatPct, formatNumber } from '../lib/formatters';
import type { SocialAccount, SocialMetrics, SocialTopContent, SocialDemographic, ReportingPeriod } from '../lib/types';
import { Users, Eye, Heart, MousePointer, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { CHART_PALETTE, PLATFORM_COLORS } from '../lib/chartColors';

function Stat({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon?: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="flex items-center gap-3 py-2">
      {Icon && <Icon size={16} className="text-gray-400 shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm font-semibold text-gray-900">{value}</div>
      </div>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

export function SocialMedia() {
  const [allAccounts, setAllAccounts] = useState<SocialAccount[]>([]);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [period, setPeriod] = useState<ReportingPeriod | null>(null);
  const [metrics, setMetrics] = useState<SocialMetrics | null>(null);
  const [topContent, setTopContent] = useState<SocialTopContent[]>([]);
  const [demographics, setDemographics] = useState<SocialDemographic[]>([]);
  const [loading, setLoading] = useState(false);
  const [allMetrics, setAllMetrics] = useState<(SocialMetrics & { account?: SocialAccount })[]>([]);

  useEffect(() => {
    accountsApi.list().then(r => setAllAccounts(r.accounts)).catch(() => {});
  }, []);

  // Load ALL accounts' metrics for this period (for the overview)
  useEffect(() => {
    if (!periodId || !allAccounts.length) return;
    Promise.all(
      allAccounts.map(acc =>
        dashboard.social(acc.id, periodId)
          .then(r => r.metrics ? { ...r.metrics, account: acc } : null)
          .catch(() => null)
      )
    ).then(results => {
      setAllMetrics(results.filter(Boolean) as (SocialMetrics & { account?: SocialAccount })[]);
    });
  }, [periodId, allAccounts]);

  // Load specific account detail
  useEffect(() => {
    if (!accountId || !periodId) { setMetrics(null); return; }
    setLoading(true);
    dashboard.social(accountId, periodId)
      .then(r => { setMetrics(r.metrics); setTopContent(r.topContent); setDemographics(r.demographics); })
      .catch(() => { setMetrics(null); setTopContent([]); setDemographics([]); })
      .finally(() => setLoading(false));
  }, [accountId, periodId]);

  const account = allAccounts.find(a => a.id === accountId);
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
  const cityData = demographics.filter(d => d.demo_type === 'city').sort((a, b) => (b.percentage || 0) - (a.percentage || 0));

  // Accounts that actually have data
  const accountsWithData = allMetrics.filter(m => m.total_views || m.total_followers || m.total_interactions);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Media</h1>
          {period && <p className="text-sm text-gray-500">{period.label}</p>}
        </div>
        <PeriodSelector value={periodId} onChange={(id, p) => { setPeriodId(id); setPeriod(p); }} />
      </div>

      {/* Overview: All accounts at a glance */}
      {accountsWithData.length > 0 && !accountId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accountsWithData.map(m => (
            <button
              key={m.id}
              onClick={() => setAccountId(m.account_id)}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-left hover:border-gray-300 hover:shadow transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[m.account?.platform || ''] || '#666' }} />
                <span className="text-sm font-semibold text-gray-900">{m.account?.account_name}</span>
                <span className="text-xs text-gray-400 capitalize">{m.account?.platform}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {m.total_views != null && <div><span className="text-gray-500">Views</span><div className="font-semibold">{formatCompact(m.total_views)}</div></div>}
                {m.total_followers != null && <div><span className="text-gray-500">Followers</span><div className="font-semibold">{formatCompact(m.total_followers)}</div></div>}
                {m.total_interactions != null && <div><span className="text-gray-500">Interactions</span><div className="font-semibold">{formatCompact(m.total_interactions)}</div></div>}
                {m.net_follower_growth != null && <div><span className="text-gray-500">Growth</span><div className="font-semibold text-emerald-600">+{formatCompact(m.net_follower_growth)}</div></div>}
              </div>
            </button>
          ))}
        </div>
      )}

      {accountsWithData.length === 0 && !loading && (
        <div className="text-center py-20 text-gray-400">No social media data for this period.</div>
      )}

      {/* Account selector (shown when viewing a specific account) */}
      {accountId && (
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setAccountId(null)} className="text-sm text-primary hover:underline">&larr; All accounts</button>
          <span className="text-gray-300">|</span>
          {allAccounts.map(a => (
            <button
              key={a.id}
              onClick={() => setAccountId(a.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                a.id === accountId
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={a.id === accountId ? { backgroundColor: PLATFORM_COLORS[a.platform] || '#666' } : {}}
            >
              {a.account_name} - {a.platform}
            </button>
          ))}
        </div>
      )}

      {/* Account Detail */}
      {accountId && loading && <div className="text-center py-12 text-gray-400">Loading...</div>}

      {accountId && !loading && !metrics && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
          No data available for {account?.account_name} ({account?.platform}) in this period.
          Try selecting a different account above.
        </div>
      )}

      {accountId && metrics && (
        <>
          {/* Key metrics row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <Stat label="Total Views" value={formatCompact(metrics.total_views)} icon={Eye} />
              {metrics.views_change_pct != null && (
                <div className="flex items-center gap-1 mt-1">
                  {metrics.views_change_pct >= 0 ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-rose-500" />}
                  <span className={`text-xs font-medium ${metrics.views_change_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {metrics.views_change_pct > 0 ? '+' : ''}{metrics.views_change_pct}% vs prior period
                  </span>
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <Stat label="Interactions" value={formatCompact(metrics.total_interactions)} icon={Heart} />
              <div className="text-xs text-gray-400 mt-1">
                {metrics.interactions_from_followers_pct != null && `${formatPct(metrics.interactions_from_followers_pct)} from followers`}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <Stat label="Followers" value={formatCompact(metrics.total_followers)} icon={Users} />
              {metrics.net_follower_growth != null && (
                <div className="text-xs text-emerald-600 font-medium mt-1">+{metrics.net_follower_growth} net growth</div>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <Stat label="Profile Activity" value={formatCompact(metrics.total_profile_activity)} icon={MousePointer} />
              {metrics.profile_activity_change_pct != null && (
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-xs font-medium ${metrics.profile_activity_change_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {metrics.profile_activity_change_pct > 0 ? '+' : ''}{metrics.profile_activity_change_pct}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Detailed metrics */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Views & Reach</h3>
              <div className="grid grid-cols-2 gap-x-6">
                {metrics.three_sec_views != null && <Stat label="3-Second Views" value={formatCompact(metrics.three_sec_views)} />}
                {metrics.one_min_views != null && <Stat label="1-Minute Views" value={formatCompact(metrics.one_min_views)} />}
                {metrics.accounts_reached != null && <Stat label="Accounts Reached" value={formatCompact(metrics.accounts_reached)} />}
                <Stat label="From Followers" value={formatPct(metrics.follower_views_pct)} />
                <Stat label="From Non-Followers" value={formatPct(metrics.non_follower_views_pct)} />
              </div>

              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Interactions</h3>
              <div className="grid grid-cols-3 gap-x-4">
                {metrics.likes != null && <Stat label="Likes" value={formatNumber(metrics.likes)} />}
                {metrics.comments != null && <Stat label="Comments" value={formatNumber(metrics.comments)} />}
                {metrics.saves != null && <Stat label="Saves" value={formatNumber(metrics.saves)} />}
                {metrics.shares != null && <Stat label="Shares" value={formatNumber(metrics.shares)} />}
                {metrics.reposts != null && <Stat label="Reposts" value={formatNumber(metrics.reposts)} />}
              </div>

              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Followers</h3>
              <div className="grid grid-cols-2 gap-x-6">
                <Stat label="Total" value={formatCompact(metrics.total_followers)} />
                <Stat label="Net Growth" value={metrics.net_follower_growth != null ? `+${metrics.net_follower_growth}` : '--'} />
                <Stat label="New Follows" value={formatNumber(metrics.new_follows)} />
                <Stat label="Unfollows" value={formatNumber(metrics.unfollows)} />
              </div>

              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Profile</h3>
              <div className="grid grid-cols-2 gap-x-6">
                <Stat label="Profile Visits" value={formatNumber(metrics.profile_visits)} icon={ExternalLink} />
                <Stat label="Link Taps" value={formatNumber(metrics.external_link_taps)} />
              </div>
            </div>

            {/* Charts side */}
            <div className="space-y-4">
              {/* Content type pie */}
              {viewsByType.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Views by Content Type</h3>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={viewsByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35}
                          label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                          {viewsByType.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => `${v}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Interaction bar chart */}
              {interactionData.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Interaction Breakdown</h3>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={interactionData} layout="vertical" barSize={16}>
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={65} />
                        <Tooltip />
                        <Bar dataKey="value" fill={CHART_PALETTE[1]} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Gender */}
              {metrics.gender_male_pct != null && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Gender Split</h3>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-blue-700">{formatPct(metrics.gender_male_pct)}</div>
                      <div className="text-xs text-blue-600">Men</div>
                    </div>
                    <div className="flex-1 bg-pink-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-pink-700">{formatPct(metrics.gender_female_pct)}</div>
                      <div className="text-xs text-pink-600">Women</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Demographics */}
          {(ageData.length > 0 || countryData.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Age */}
              {ageData.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Audience by Age</h3>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageData} barSize={20}>
                        <XAxis dataKey="demo_value" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
                        <Tooltip formatter={(v: number) => `${v}%`} />
                        <Bar dataKey="percentage" name="All" fill={CHART_PALETTE[0]} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Countries & Cities */}
              {(countryData.length > 0 || cityData.length > 0) && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Top Locations</h3>
                  {countryData.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1.5">Countries</div>
                      {countryData.map(c => (
                        <div key={c.demo_value} className="flex justify-between py-1 text-sm">
                          <span className="text-gray-700">{c.demo_value}</span>
                          <span className="text-gray-500 font-medium">{formatPct(c.percentage)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {cityData.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1.5 mt-3">Cities</div>
                      {cityData.map(c => (
                        <div key={c.demo_value} className="flex justify-between py-1 text-sm">
                          <span className="text-gray-700">{c.demo_value}</span>
                          <span className="text-gray-500 font-medium">{formatPct(c.percentage)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Top Content */}
          {topContent.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Top Content</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-200">
                    <th className="py-2 text-left">#</th>
                    <th className="py-2 text-left">Content</th>
                    <th className="py-2 text-left">Type</th>
                    <th className="py-2 text-right">Views</th>
                    <th className="py-2 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {topContent.map(tc => (
                    <tr key={tc.id} className="border-b border-gray-50">
                      <td className="py-2 text-gray-400">{tc.rank_position}</td>
                      <td className="py-2 font-medium">{tc.content_title || '--'}</td>
                      <td className="py-2 text-gray-500 capitalize">{tc.content_type || '--'}</td>
                      <td className="py-2 text-right font-semibold">{formatCompact(tc.metric_value)}</td>
                      <td className="py-2 text-right text-gray-500">{tc.content_date || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
