import { useState, useEffect } from 'react';
import { periods as periodsApi } from '../lib/api';
import type { ReportingPeriod } from '../lib/types';

interface PeriodSelectorProps {
  value: number | null;
  onChange: (periodId: number, period: ReportingPeriod) => void;
  filter?: 'all' | 'quarterly' | 'monthly';
}

export function PeriodSelector({ value, onChange, filter = 'all' }: PeriodSelectorProps) {
  const [periods, setPeriods] = useState<ReportingPeriod[]>([]);

  useEffect(() => {
    periodsApi.list().then(r => {
      let filtered = r.periods;
      if (filter === 'quarterly') filtered = filtered.filter(p => !p.month);
      if (filter === 'monthly') filtered = filtered.filter(p => p.month);
      setPeriods(filtered);
      if (!value && filtered.length > 0) {
        onChange(filtered[0].id, filtered[0]);
      }
    }).catch(() => {});
  }, [filter]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <select
      value={value || ''}
      onChange={e => {
        const id = parseInt(e.target.value);
        const p = periods.find(p => p.id === id);
        if (p) onChange(id, p);
      }}
      className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
    >
      {periods.map(p => (
        <option key={p.id} value={p.id}>{p.label}</option>
      ))}
      {!periods.length && <option value="">No periods</option>}
    </select>
  );
}
