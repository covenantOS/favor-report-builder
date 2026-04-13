export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '--';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export function formatCurrencyDetailed(value: number | null | undefined): string {
  if (value == null) return '--';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return '--';
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatCompact(value: number | null | undefined): string {
  if (value == null) return '--';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

export function formatPct(value: number | null | undefined, decimals = 1): string {
  if (value == null) return '--';
  return `${value.toFixed(decimals)}%`;
}

export function formatDelta(value: number | null | undefined): string {
  if (value == null) return '--';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function parsePct(s: string | null | undefined): number | null {
  if (!s) return null;
  const cleaned = s.replace('%', '').replace('+', '').trim();
  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val;
}

export function parseCurrency(s: string | null | undefined): number | null {
  if (!s || s === '--') return null;
  const cleaned = s.replace(/[$,K]/g, '').trim();
  if (s.includes('K')) {
    const val = parseFloat(cleaned) * 1000;
    return isNaN(val) ? null : val;
  }
  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val;
}
