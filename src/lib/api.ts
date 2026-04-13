import type { User, ReportingPeriod, SocialAccount, SocialMetrics, SocialTopContent, SocialDemographic, DirectMailAppeal, EmailNewsletter, ThankYouReceipt, DashboardSummary, UploadLogEntry } from './types';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'same-origin',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json() as Promise<T>;
}

// Auth
export const auth = {
  login: (username: string, password: string) =>
    request<{ user: User }>('auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request<{ ok: boolean }>('auth/logout', { method: 'POST' }),
  me: () => request<{ user: User }>('auth/me'),
  setup: (username: string, password: string, name: string) =>
    request<{ user: User }>('auth/setup', { method: 'POST', body: JSON.stringify({ username, password, name }) }),
};

// Periods
export const periods = {
  list: () => request<{ periods: ReportingPeriod[] }>('periods'),
  create: (data: { year: number; quarter: number; month?: number }) =>
    request<{ period: ReportingPeriod }>('periods', { method: 'POST', body: JSON.stringify(data) }),
};

// Social Accounts
export const accounts = {
  list: () => request<{ accounts: SocialAccount[] }>('accounts'),
};

// Dashboard
export const dashboard = {
  summary: (periodId?: number) =>
    request<DashboardSummary>(`dashboard/summary${periodId ? `?period_id=${periodId}` : ''}`),
  social: (accountId: number, periodId: number) =>
    request<{ metrics: SocialMetrics; topContent: SocialTopContent[]; demographics: SocialDemographic[] }>(
      `dashboard/social?account_id=${accountId}&period_id=${periodId}`
    ),
  mail: (periodId: number) =>
    request<{ appeals: DirectMailAppeal[] }>(`dashboard/mail?period_id=${periodId}`),
  email: (periodId: number) =>
    request<{ newsletters: EmailNewsletter[] }>(`dashboard/email?period_id=${periodId}`),
  thankyou: (periodId: number) =>
    request<{ receipts: ThankYouReceipt[] }>(`dashboard/thankyou?period_id=${periodId}`),
  trends: (category: string, metric: string, limit?: number) =>
    request<{ data: { period_label: string; value: number }[] }>(
      `dashboard/trends?category=${category}&metric=${metric}${limit ? `&limit=${limit}` : ''}`
    ),
};

// Data management
export const data = {
  deletePeriod: (category: string, periodId: number) =>
    request<{ ok: boolean }>(`data/${category}/${periodId}`, { method: 'DELETE' }),
};

// Upload log
export const uploads = {
  list: () => request<{ uploads: UploadLogEntry[] }>('uploads'),
};
