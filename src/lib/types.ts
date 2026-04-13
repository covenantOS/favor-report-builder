export interface User {
  id: number;
  username: string;
  name: string | null;
  role: 'admin' | 'viewer';
}

export interface ReportingPeriod {
  id: number;
  year: number;
  quarter: number;
  month: number | null;
  label: string;
}

export interface SocialAccount {
  id: number;
  platform: 'facebook' | 'instagram' | 'tiktok';
  account_name: string;
  account_type: 'organization' | 'personal';
}

export interface SocialMetrics {
  id: number;
  account_id: number;
  period_id: number;
  total_views: number | null;
  three_sec_views: number | null;
  one_min_views: number | null;
  accounts_reached: number | null;
  views_change_pct: number | null;
  views_by_content_type: Record<string, number> | null;
  follower_views_pct: number | null;
  non_follower_views_pct: number | null;
  total_interactions: number | null;
  interactions_from_followers_pct: number | null;
  interactions_from_non_followers_pct: number | null;
  likes: number | null;
  comments: number | null;
  saves: number | null;
  shares: number | null;
  reposts: number | null;
  total_profile_activity: number | null;
  profile_visits: number | null;
  external_link_taps: number | null;
  profile_activity_change_pct: number | null;
  total_followers: number | null;
  net_follower_growth: number | null;
  new_follows: number | null;
  unfollows: number | null;
  followers_change_pct: number | null;
  gender_male_pct: number | null;
  gender_female_pct: number | null;
  account?: SocialAccount;
  period?: ReportingPeriod;
}

export interface SocialTopContent {
  id: number;
  account_id: number;
  period_id: number;
  ranking_type: string;
  rank_position: number;
  content_title: string | null;
  content_type: string | null;
  metric_value: number | null;
  content_date: string | null;
}

export interface SocialDemographic {
  id: number;
  account_id: number;
  period_id: number;
  demo_type: 'country' | 'city' | 'age_range';
  demo_value: string;
  percentage: number | null;
  male_pct: number | null;
  female_pct: number | null;
}

export interface DirectMailAppeal {
  id: number;
  period_id: number;
  appeal_id: string;
  description: string | null;
  topic_audience: string | null;
  num_solicitors: number | null;
  gifts: number | null;
  donors: number | null;
  response_pct: number | null;
  total_given: number | null;
  avg_per_gift: number | null;
  avg_per_donor: number | null;
  goal: number | null;
  over_under: number | null;
  total_cost: number | null;
  cost_per_gift: number | null;
  cost_per_donor: number | null;
  brm_returns_cost: number | null;
  profit_loss: number | null;
  package_cost: number | null;
  period?: ReportingPeriod;
}

export interface EmailNewsletter {
  id: number;
  period_id: number;
  name: string;
  status: string | null;
  subject_line: string | null;
  audience_list: string | null;
  date_sent: string | null;
  is_resend: boolean;
  original_newsletter_id: number | null;
  recipients: number | null;
  opens: number | null;
  clicks: number | null;
  transactions: number | null;
  total_raised: number | null;
  bounces: number | null;
  unsubscribes: number | null;
  period?: ReportingPeriod;
}

export interface ThankYouReceipt {
  id: number;
  period_id: number;
  appeal_id: string;
  description: string | null;
  num_solicitors: number | null;
  gifts: number | null;
  donors: number | null;
  response_pct: number | null;
  total_given: number | null;
  avg_per_gift: number | null;
  avg_per_donor: number | null;
  total_cost: number | null;
  cost_per_gift: number | null;
  cost_per_donor: number | null;
  period?: ReportingPeriod;
}

export interface UploadLogEntry {
  id: number;
  uploaded_by: string;
  data_category: string;
  period_label: string | null;
  rows_imported: number | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface DashboardSummary {
  social: {
    totalFollowers: number;
    totalViews: number;
    totalInteractions: number;
    followerGrowth: number;
  };
  mail: {
    totalGiven: number;
    totalGifts: number;
    avgPerGift: number;
    totalAppeals: number;
  };
  email: {
    avgOpenRate: number;
    avgClickRate: number;
    totalRaised: number;
    totalSent: number;
  };
  thankyou: {
    totalGifts: number;
    totalDonors: number;
    totalGiven: number;
    avgPerGift: number;
  };
  currentPeriod: ReportingPeriod | null;
}
