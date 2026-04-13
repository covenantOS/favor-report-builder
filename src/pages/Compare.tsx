import { useState, useEffect } from 'react';
import { PeriodSelector } from '../components/PeriodSelector';
import { dashboard } from '../lib/api';
import { formatCurrency, formatCompact, formatPct } from '../lib/formatters';
import type { DashboardSummary, ReportingPeriod } from '../lib/types';
import { ArrowRight } from 'lucide-react';

function CompareRow({ label, v1, v2, format }: { label: string; v1: number; v2: number; format: (n: number) => string }) {
  const delta = v1 > 0 ? ((v2 - v1) / v1) * 100 : 0;
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600 w-40">{label}</span>
      <span className="text-sm font-medium w-28 text-right">{format(v1)}</span>
      <ArrowRight size={14} className="text-gray-300 mx-2" />
      <span className="text-sm font-medium w-28 text-right">{format(v2)}</span>
      <span className={`text-sm font-medium w-24 text-right ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-gray-400'}`}>
        {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
      </span>
    </div>
  );
}

export function Compare() {
  const [period1Id, setPeriod1Id] = useState<number | null>(null);
  const [period2Id, setPeriod2Id] = useState<number | null>(null);
  const [period1, setPeriod1] = useState<ReportingPeriod | null>(null);
  const [period2, setPeriod2] = useState<ReportingPeriod | null>(null);
  const [summary1, setSummary1] = useState<DashboardSummary | null>(null);
  const [summary2, setSummary2] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    if (period1Id) dashboard.summary(period1Id).then(setSummary1).catch(() => setSummary1(null));
  }, [period1Id]);

  useEffect(() => {
    if (period2Id) dashboard.summary(period2Id).then(setSummary2).catch(() => setSummary2(null));
  }, [period2Id]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Period Comparison</h1>
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Period A</label>
          <PeriodSelector value={period1Id} onChange={(id, p) => { setPeriod1Id(id); setPeriod1(p); }} />
        </div>
        <ArrowRight size={20} className="text-gray-300 mt-4" />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Period B</label>
          <PeriodSelector value={period2Id} onChange={(id, p) => { setPeriod2Id(id); setPeriod2(p); }} />
        </div>
      </div>

      {summary1 && summary2 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Social Media: {period1?.label} vs {period2?.label}</h3>
            <CompareRow label="Total Followers" v1={summary1.social.totalFollowers} v2={summary2.social.totalFollowers} format={formatCompact} />
            <CompareRow label="Total Views" v1={summary1.social.totalViews} v2={summary2.social.totalViews} format={formatCompact} />
            <CompareRow label="Interactions" v1={summary1.social.totalInteractions} v2={summary2.social.totalInteractions} format={formatCompact} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Direct Mail: {period1?.label} vs {period2?.label}</h3>
            <CompareRow label="Total Given" v1={summary1.mail.totalGiven} v2={summary2.mail.totalGiven} format={formatCurrency} />
            <CompareRow label="Total Gifts" v1={summary1.mail.totalGifts} v2={summary2.mail.totalGifts} format={formatCompact} />
            <CompareRow label="Avg per Gift" v1={summary1.mail.avgPerGift} v2={summary2.mail.avgPerGift} format={formatCurrency} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Email: {period1?.label} vs {period2?.label}</h3>
            <CompareRow label="Open Rate" v1={summary1.email.avgOpenRate} v2={summary2.email.avgOpenRate} format={v => formatPct(v)} />
            <CompareRow label="Click Rate" v1={summary1.email.avgClickRate} v2={summary2.email.avgClickRate} format={v => formatPct(v)} />
            <CompareRow label="Total Raised" v1={summary1.email.totalRaised} v2={summary2.email.totalRaised} format={formatCurrency} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Thank You: {period1?.label} vs {period2?.label}</h3>
            <CompareRow label="Total Given" v1={summary1.thankyou.totalGiven} v2={summary2.thankyou.totalGiven} format={formatCurrency} />
            <CompareRow label="Total Gifts" v1={summary1.thankyou.totalGifts} v2={summary2.thankyou.totalGifts} format={formatCompact} />
            <CompareRow label="Avg per Gift" v1={summary1.thankyou.avgPerGift} v2={summary2.thankyou.avgPerGift} format={formatCurrency} />
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">Select two periods above to compare.</div>
      )}
    </div>
  );
}
