import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string;
  delta?: number | null;
  deltaLabel?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  color?: 'blue' | 'green' | 'amber' | 'rose' | 'purple';
}

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
  rose: { bg: 'bg-rose-50', icon: 'text-rose-600', border: 'border-rose-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
};

export function KPICard({ label, value, delta, deltaLabel, icon: Icon, color = 'blue' }: KPICardProps) {
  const c = colorMap[color];
  return (
    <div className={`bg-white rounded-xl border ${c.border} p-5 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        {Icon && (
          <div className={`${c.bg} p-2.5 rounded-lg`}>
            <Icon size={20} className={c.icon} />
          </div>
        )}
      </div>
      {delta != null && (
        <div className="flex items-center gap-1.5 mt-3">
          {delta > 0 ? (
            <TrendingUp size={14} className="text-emerald-500" />
          ) : delta < 0 ? (
            <TrendingDown size={14} className="text-rose-500" />
          ) : (
            <Minus size={14} className="text-gray-400" />
          )}
          <span className={`text-sm font-medium ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-gray-500'}`}>
            {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
          </span>
          {deltaLabel && <span className="text-xs text-gray-400">{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}
