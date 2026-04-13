-- Seed reporting periods
-- 2025 quarters (for YoY appeal comparison only)
INSERT OR IGNORE INTO reporting_periods (year, quarter, month, label) VALUES (2025, 1, NULL, '2025-Q1');
INSERT OR IGNORE INTO reporting_periods (year, quarter, month, label) VALUES (2025, 2, NULL, '2025-Q2');
INSERT OR IGNORE INTO reporting_periods (year, quarter, month, label) VALUES (2025, 3, NULL, '2025-Q3');
INSERT OR IGNORE INTO reporting_periods (year, quarter, month, label) VALUES (2025, 4, NULL, '2025-Q4');
-- 2026 Q1
INSERT OR IGNORE INTO reporting_periods (year, quarter, month, label) VALUES (2026, 1, NULL, '2026-Q1');
INSERT OR IGNORE INTO reporting_periods (year, quarter, month, label) VALUES (2026, 1, 1, '2026-01');
INSERT OR IGNORE INTO reporting_periods (year, quarter, month, label) VALUES (2026, 1, 2, '2026-02');
INSERT OR IGNORE INTO reporting_periods (year, quarter, month, label) VALUES (2026, 1, 3, '2026-03');

-- ============================================================
-- 2025 DIRECT MAIL APPEALS (reference data for YoY comparison)
-- Source: MK25 L25 Appeal Reports q1-q4.xlsx
-- BRM cost = $1.77/piece throughout 2025
-- ============================================================

-- Q1 2025
INSERT OR REPLACE INTO direct_mail_appeals (period_id, appeal_id, description, topic_audience, num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, total_cost, brm_returns_cost, profit_loss, cost_per_donor, package_cost)
VALUES ((SELECT id FROM reporting_periods WHERE label='2025-Q1'), 'L251', 'Online/Other', NULL, NULL, 32, NULL, NULL, 1403.28, 43.85, 0, 0, 1403.28, 0, NULL);
INSERT OR REPLACE INTO direct_mail_appeals (period_id, appeal_id, description, topic_audience, num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, total_cost, brm_returns_cost, profit_loss, cost_per_donor, package_cost)
VALUES ((SELECT id FROM reporting_periods WHERE label='2025-Q1'), 'L252', 'Otim (Active Donors)', 'Otim (Active Donors)', 2112, 83, NULL, 3.93, 10744.00, 129.45, 2371.93, 146.91, 8372.07, 28.58, 2225.02);
INSERT OR REPLACE INTO direct_mail_appeals (period_id, appeal_id, description, topic_audience, num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, total_cost, brm_returns_cost, profit_loss, cost_per_donor, package_cost)
VALUES ((SELECT id FROM reporting_periods WHERE label='2025-Q1'), 'L253', 'Rajad (Active Donors)', 'Rajad (Active Donors)', 2726, 116, NULL, 4.26, 14836.34, 127.90, 2696.07, 205.32, 12140.27, 23.24, 2490.75);

-- Q2 2025
INSERT OR REPLACE INTO direct_mail_appeals (period_id, appeal_id, description, topic_audience, num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, total_cost, brm_returns_cost, profit_loss, cost_per_donor, package_cost)
VALUES ((SELECT id FROM reporting_periods WHERE label='2025-Q2'), 'L254', 'FISOM', 'FISOM', 2699, 88, NULL, 3.26, 18474.19, 209.93, 2684.91, 155.76, 15789.28, 30.51, 2529.15);
INSERT OR REPLACE INTO direct_mail_appeals (period_id, appeal_id, description, topic_audience, num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, total_cost, brm_returns_cost, profit_loss, cost_per_donor, package_cost)
VALUES ((SELECT id FROM reporting_periods WHERE label='2025-Q2'), 'L255', 'PBS', 'PBS', 2766, 146, NULL, 5.28, 11144.57, 76.33, 3201.18, 258.42, 7943.39, 21.93, 2942.76);
INSERT OR REPLACE INTO direct_mail_appeals (period_id, appeal_id, description, topic_audience, num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, total_cost, brm_returns_cost, profit_loss, cost_per_donor, package_cost)
VALUES ((SELECT id FROM reporting_periods WHERE label='2025-Q2'), 'L256', 'GIFT', 'GIFT', 3226, 178, NULL, 5.52, 12990.36, 72.98, 3257.82, 315.06, 9732.54, 18.30, 2942.76);

-- Q3 2025
INSERT OR REPLACE INTO direct_mail_appeals (period_id, appeal_id, description, topic_audience, num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, total_cost, brm_returns_cost, profit_loss, cost_per_donor, package_cost)
VALUES ((SELECT id FROM reporting_periods WHERE label='2025-Q3'), 'L257', 'PBS', 'PBS', 3207, 166, NULL, 5.15, 16137.56, 97.21, 3339.52, 293.82, 12798.04, 20.12, 3045.70);
INSERT OR REPLACE INTO direct_mail_appeals (period_id, appeal_id, description, topic_audience, num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, total_cost, brm_returns_cost, profit_loss, cost_per_donor, package_cost)
VALUES ((SELECT id FROM reporting_periods WHERE label='2025-Q3'), 'L258', 'GIFT', 'GIFT', 3226, 141, NULL, 4.37, 7982.90, 56.62, 3347.57, 249.57, 4635.33, 23.74, 3098.00);
INSERT OR REPLACE INTO direct_mail_appeals (period_id, appeal_id, description, topic_audience, num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, total_cost, brm_returns_cost, profit_loss, cost_per_donor, package_cost)
VALUES ((SELECT id FROM reporting_periods WHERE label='2025-Q3'), 'L259', NULL, NULL, 3207, 112, NULL, 3.49, 10239.02, 91.42, 3227.79, 198.24, 7011.23, 28.82, 3029.55);

-- Q4 2025
INSERT OR REPLACE INTO direct_mail_appeals (period_id, appeal_id, description, topic_audience, num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, total_cost, brm_returns_cost, profit_loss, cost_per_donor, package_cost)
VALUES ((SELECT id FROM reporting_periods WHERE label='2025-Q4'), 'L25A', NULL, NULL, 3199, 177, NULL, 5.57, 11411.67, 64.47, 3412.44, 313.29, 7999.23, 19.28, 3099.15);
INSERT OR REPLACE INTO direct_mail_appeals (period_id, appeal_id, description, topic_audience, num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, total_cost, brm_returns_cost, profit_loss, cost_per_donor, package_cost)
VALUES ((SELECT id FROM reporting_periods WHERE label='2025-Q4'), 'L25B', NULL, NULL, 3180, 133, NULL, 4.18, 14107.05, 106.07, 3350.83, 235.41, 10756.22, 25.19, 3115.42);
INSERT OR REPLACE INTO direct_mail_appeals (period_id, appeal_id, description, topic_audience, num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, total_cost, brm_returns_cost, profit_loss, cost_per_donor, package_cost)
VALUES ((SELECT id FROM reporting_periods WHERE label='2025-Q4'), 'L25C', NULL, NULL, 3181, 127, NULL, 3.99, 18134.39, 142.79, 3341.19, 224.79, 14793.20, 26.31, 3116.40);

-- ============================================================
-- 2026 Q1 DIRECT MAIL APPEALS (from q1 2026 appeals.csv)
-- ============================================================
INSERT OR REPLACE INTO direct_mail_appeals (period_id, appeal_id, description, topic_audience, num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, avg_per_donor, total_cost, cost_per_gift, cost_per_donor)
VALUES (
  (SELECT id FROM reporting_periods WHERE label = '2026-Q1'),
  'L261-AD', 'Direct Mail, January 2026 Appeal, Obang, Active Donors', 'Obang (Active Donors)', 0, 116, 116, 0, 7756.87, 66.87, 66.87, 0, 0, 0
);
INSERT OR REPLACE INTO direct_mail_appeals (period_id, appeal_id, description, topic_audience, num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, avg_per_donor, total_cost, cost_per_gift, cost_per_donor)
VALUES (
  (SELECT id FROM reporting_periods WHERE label = '2026-Q1'),
  'L262-AD', 'Direct Mail, January 2026 Appeal, Jackline, Active Donors', 'Jackline (Active Donors)', 0, 119, 119, 0, 6268.66, 52.68, 52.68, 0, 0, 0
);
INSERT OR REPLACE INTO direct_mail_appeals (period_id, appeal_id, description, topic_audience, num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, avg_per_donor, total_cost, cost_per_gift, cost_per_donor)
VALUES (
  (SELECT id FROM reporting_periods WHERE label = '2026-Q1'),
  'L263-AD', 'Direct Mail, March 2026 Appeal, Makeach, Active Donors', 'Makeach (Active Donors)', 0, 102, 102, 0, 6697.19, 65.66, 65.66, 0, 0, 0
);

-- ============================================================
-- 2026 Q1 THANK YOU RECEIPTS (from q1 2026 ty receipts.csv)
-- ============================================================
INSERT OR REPLACE INTO thank_you_receipts (period_id, appeal_id, description, num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, avg_per_donor, goal, over_under, total_cost, cost_per_gift, cost_per_donor)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Y261-TY', 'Direct Mail, thank you letter donation, January 2026', 0, 29, 28, 0, 2453.00, 84.59, 87.61, 0, 2453.00, 0, 0, 0);
INSERT OR REPLACE INTO thank_you_receipts (period_id, appeal_id, description, num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, avg_per_donor, goal, over_under, total_cost, cost_per_gift, cost_per_donor)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Y262-TY', 'Direct Mail, thank you letter donation, February 2026', 0, 20, 20, 0, 2430.00, 121.50, 121.50, 0, 2430.00, 0, 0, 0);
INSERT OR REPLACE INTO thank_you_receipts (period_id, appeal_id, description, num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, avg_per_donor, goal, over_under, total_cost, cost_per_gift, cost_per_donor)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Y263-TY', 'Direct Mail, thank you letter donation, March 2026', 0, 16, 16, 0, 580.00, 36.25, 36.25, 0, 580.00, 0, 0, 0);

-- ============================================================
-- 2026 Q1 EMAIL NEWSLETTERS (from newsletter.docx)
-- ============================================================
-- January originals
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - January 3, 2026', 'Success', 'Happy New Year!', 'Newsletter Recipients', '1/3/26', 0, 7949, 2976, 43, 1, 250.00, 86, 38);
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - January 10, 2026', 'Success', 'SCHOOLS IN RURAL VILLAGES', 'Newsletter Recipients', '1/10/26', 0, 7972, 2681, 86, 1, 10.00, 71, 29);
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - January 17, 2026', 'Success', '2025 Annual Report', 'Newsletter Recipients', '1/17/26', 0, 7912, 2687, 94, 6, 5430.00, 97, 13);
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - January 24, 2026', 'Success', 'BAPTIZING NEW BELIEVERS!', 'Newsletter Recipients', '1/24/26', 0, 7953, 3163, 97, 2, 110.00, 72, 12);
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - January 31, 2026', 'Success', 'From Bitterness to Forgiveness!', 'Newsletter Recipients', '1/31/26', 0, 8001, 2602, 67, 5, 1320.00, 37, 19);

-- January resends
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - January 10, 2026 Resend', 'Success', 'SCHOOLS IN RURAL VILLAGES', '1/10/26 Resends', '1/13/26', 1, 5607, 537, 14, 0, 0, 37, 15);
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - January 17, 2026 Resends', 'Success', '2025 Annual Report', '1/17/26 Resends', '1/21/26', 1, 5456, 544, 14, 1, 50.00, 28, 7);
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - January 24, 2026 Resends', 'Success', 'BAPTIZING NEW BELIEVERS!', '01/24/26 Resends', '1/27/26', 1, 5032, 393, 13, 0, 0, 35, 6);
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - January 31, 2026 Resend', 'Success', 'From Bitterness to Forgiveness!', '01/31/26 Resends', '2/3/26', 1, 5631, 518, 10, 1, 50.00, 27, 13);

-- February originals
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - February 7, 2026', 'Success', 'CHANGING COMMUNITIES BY EMPOWERING WOMEN!', 'Newsletter Recipients', '2/7/26', 0, 7955, 3028, 98, 1, 10.00, 57, 26);
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - February 14, 2026', 'Success', 'From a Drinking Den to a House of Prayer', 'Newsletter Recipients', '2/14/26', 0, 7968, 2977, 60, 2, 263.00, 34, 16);
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - February 21, 2026', 'Success', 'ON THIS ROCK I WILL BUILD MY CHURCH!', 'Newsletter Recipients', '2/21/26', 0, 7976, 2905, 93, 7, 1230.00, 88, 15);
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - January 17, 2026 - February Resend', 'Success', '2025 Annual Report', 'Newsletter Recipients', '2/28/26', 0, 8841, 3374, 95, 5, 1050.00, 64, 52);

-- February resends
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - February 7, 2026 Resends', 'Success', 'CHANGING COMMUNITIES BY EMPOWERING WOMEN!', '02/07/26 Resends', '2/10/26', 1, 5303, 695, 23, 0, 0, 28, 14);
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - February 14, 2026 Resends', 'Success', 'From a Drinking Den to a House of Prayer', '2/14/26 Resends', '2/17/26', 1, 5220, 575, 10, 0, 0, 33, 14);
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - February 21, 2026 Resend', 'Success', 'ON THIS ROCK I WILL BUILD MY CHURCH!', '2/21/26 NL Resend', '2/24/26', 1, 5275, 630, 12, 4, 994.00, 8, 12);

-- March originals
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - March 7, 2026', 'Success', 'A NATION ON ITS KNEES!', 'Newsletter Recipients', '3/7/26', 0, 8760, 3285, 92, 2, 14000.00, 93, 43);
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - March 14, 2026', 'Success', 'NATION CHANGERS!', 'Newsletter Recipients', '3/14/26', 0, 8842, 3139, 85, 7, 745.00, 49, 39);
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - March 21, 2026', 'Success', 'From Revenge to Redemption', 'Newsletter Recipients', '3/21/26', 0, 8741, 3076, 62, 1, 100.00, 95, 24);
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - March 28, 2026', 'Success', 'MEDICAL MISSIONS BRINGING HOPE & HEALING!', 'Newsletter Recipients', '3/28/26', 0, 8773, 2844, 82, 9, 4010.00, 51, 22);

-- March resends
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - March 7, 2026 Resend', 'Success', 'A NATION ON ITS KNEES!', '3/7/26 Resend', '3/10/26', 1, 5736, 622, 9, 0, 0, 10, 14);
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - March 14, 2026 Resends', 'Success', 'NATION CHANGERS!', '3/14/26 Resends', '3/17/26', 1, 5973, 615, 16, 1, 259.38, 10, 17);
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - March 21, 2026 RESEND', 'Success', 'From Revenge to Redemption', '3/21/26 resends', '3/24/26', 1, 5819, 563, 13, 1, 50.00, 13, 14);
INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent, is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
VALUES ((SELECT id FROM reporting_periods WHERE label = '2026-Q1'), 'Newsletter - March 28, 2026 resend', 'Success', 'MEDICAL MISSIONS BRINGING HOPE & HEALING!', '3/28/26 resends', '3/31/26', 1, 6147, 816, 17, 4, 268.94, 11, 9);

-- ============================================================
-- 2026 Q1 SOCIAL MEDIA (from Social Media Master Report)
-- ============================================================

-- Carole Ward - Facebook Q1
INSERT OR REPLACE INTO social_metrics (account_id, period_id, total_views, three_sec_views, one_min_views, accounts_reached, views_change_pct, views_by_content_type, follower_views_pct, non_follower_views_pct, total_interactions, total_profile_activity, total_followers, net_follower_growth, new_follows, unfollows, followers_change_pct)
VALUES (
  (SELECT id FROM social_accounts WHERE platform='facebook' AND account_name='Carole Ward'),
  (SELECT id FROM reporting_periods WHERE label='2026-Q1'),
  73400, 28841, 3636, 26582, 19.2,
  '{"Reels":92.4,"Multi Photo":5.5,"Photo":1.9,"Link":0.1}',
  43.6, 56.4, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

-- Favor International - Facebook Q1
INSERT OR REPLACE INTO social_metrics (account_id, period_id, total_views, three_sec_views, one_min_views, views_change_pct, views_by_content_type, follower_views_pct, non_follower_views_pct)
VALUES (
  (SELECT id FROM social_accounts WHERE platform='facebook' AND account_name='Favor International'),
  (SELECT id FROM reporting_periods WHERE label='2026-Q1'),
  107014, 5893, 179, 144.0,
  '{"Multi Photo":76,"Reels":14.5,"Photo":9.4,"Multi Media":0.3}',
  40.2, 59.8
);

-- Carole Ward - Instagram Q1
INSERT OR REPLACE INTO social_metrics (account_id, period_id, total_views, accounts_reached, views_change_pct, views_by_content_type, follower_views_pct, non_follower_views_pct, total_interactions, interactions_from_followers_pct, interactions_from_non_followers_pct, likes, comments, saves, shares, reposts, total_profile_activity, profile_visits, external_link_taps, profile_activity_change_pct, total_followers, net_follower_growth, new_follows, unfollows, followers_change_pct, gender_male_pct, gender_female_pct)
VALUES (
  (SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Carole Ward'),
  (SELECT id FROM reporting_periods WHERE label='2026-Q1'),
  61163, 24931, 38.5,
  '{"Reels":93.0,"Posts":7.0}',
  15.1, 84.9,
  3854, 56.1, 43.9,
  2452, 91, 401, 385, 140,
  817, 788, 29, -58.9,
  619, 152, 205, 53, 32.5,
  30.7, 69.3
);

-- Favor International - Instagram Q1
INSERT OR REPLACE INTO social_metrics (account_id, period_id, total_views, accounts_reached, views_change_pct, views_by_content_type, follower_views_pct, non_follower_views_pct, total_interactions, interactions_from_followers_pct, interactions_from_non_followers_pct, likes, comments, saves, shares, reposts, total_profile_activity, profile_visits, external_link_taps, profile_activity_change_pct, total_followers, net_follower_growth, new_follows, unfollows, followers_change_pct, gender_male_pct, gender_female_pct)
VALUES (
  (SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'),
  (SELECT id FROM reporting_periods WHERE label='2026-Q1'),
  31473, 4157, 87.1,
  '{"Posts":76.5,"Reels":16.3,"Stories":7.2}',
  50.4, 49.6,
  1295, 85.6, 14.4,
  660, 46, 14, 110, 61,
  751, 726, 25, -14.4,
  2200, 55, 121, 66, 2.6,
  22.9, 77.1
);

-- Carole Ward - TikTok Q1
INSERT OR REPLACE INTO social_metrics (account_id, period_id, total_views, total_interactions, likes, comments, shares, total_profile_activity, total_followers)
VALUES (
  (SELECT id FROM social_accounts WHERE platform='tiktok' AND account_name='Carole Ward'),
  (SELECT id FROM reporting_periods WHERE label='2026-Q1'),
  22000, NULL, 1000, 27, 35, 210, 226
);

-- Favor International - TikTok Q1 (limited data)
INSERT OR REPLACE INTO social_metrics (account_id, period_id, total_followers)
VALUES (
  (SELECT id FROM social_accounts WHERE platform='tiktok' AND account_name='Favor International'),
  (SELECT id FROM reporting_periods WHERE label='2026-Q1'),
  92
);

-- ============================================================
-- SOCIAL MEDIA DEMOGRAPHICS - Instagram Q1 2026
-- ============================================================

-- Carole Ward IG demographics
INSERT INTO social_demographics (account_id, period_id, demo_type, demo_value, percentage) VALUES
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Carole Ward'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'city', 'Kampala', 2.4),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Carole Ward'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'city', 'Faisalabad', 0.8),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Carole Ward'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'city', 'Sydney', 0.8),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Carole Ward'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'city', 'Houston', 0.8),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Carole Ward'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'city', 'Dallas', 0.6);

INSERT INTO social_demographics (account_id, period_id, demo_type, demo_value, percentage, male_pct, female_pct) VALUES
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Carole Ward'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'age_range', '13-17', 1.8, 3.2, 1.1),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Carole Ward'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'age_range', '18-24', 9.6, 18.5, 5.6),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Carole Ward'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'age_range', '25-34', 25.2, 31.2, 22.5),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Carole Ward'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'age_range', '35-44', 32.8, 29.3, 34.4),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Carole Ward'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'age_range', '45-54', 14.1, 8.3, 16.6),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Carole Ward'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'age_range', '55-64', 10.0, 5.1, 12.1),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Carole Ward'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'age_range', '65+', 6.6, 4.5, 7.6);

-- Favor International IG demographics
INSERT INTO social_demographics (account_id, period_id, demo_type, demo_value, percentage) VALUES
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'country', 'United States', 47.6),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'country', 'India', 6.5),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'country', 'South Africa', 4.8),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'country', 'Nigeria', 4.7),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'country', 'Kenya', 3.7);

INSERT INTO social_demographics (account_id, period_id, demo_type, demo_value, percentage) VALUES
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'city', 'Lagos', 1.8),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'city', 'Nairobi', 1.5),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'city', 'Kampala', 1.5),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'city', 'Cape Town', 0.8);

INSERT INTO social_demographics (account_id, period_id, demo_type, demo_value, percentage, male_pct, female_pct) VALUES
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'age_range', '13-17', 0.9, 1.4, 0.8),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'age_range', '18-24', 6.2, 9.6, 5.2),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'age_range', '25-34', 22.5, 25.0, 21.8),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'age_range', '35-44', 29.0, 32.9, 27.8),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'age_range', '45-54', 20.0, 16.3, 21.0),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'age_range', '55-64', 12.7, 7.9, 14.2),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'age_range', '65+', 8.7, 6.7, 9.2);

-- ============================================================
-- SOCIAL MEDIA TOP CONTENT - Q1 2026
-- ============================================================

-- Carole Ward IG top content by views
INSERT INTO social_top_content (account_id, period_id, ranking_type, rank_position, content_title, content_type, metric_value, content_date) VALUES
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Carole Ward'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'views', 1, 'Why Americans Don''t Hear God', 'Reel', 31000, 'Feb 26'),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Carole Ward'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'views', 2, 'Top Reel #2', 'Reel', 18000, 'Mar 11'),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Carole Ward'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'views', 3, 'Top Reel #3', 'Reel', 1500, 'Feb 3'),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Carole Ward'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'views', 4, 'Top Reel #4', 'Reel', 1100, 'Mar 5');

-- Favor International IG top content by views
INSERT INTO social_top_content (account_id, period_id, ranking_type, rank_position, content_title, content_type, metric_value, content_date) VALUES
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'views', 1, 'Top Post #1 (child photo)', 'Post', 2300, 'Feb 27'),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'views', 2, 'Top Post #2', 'Post', 1500, 'Feb 3'),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'views', 3, 'Top Post #3', 'Post', 1100, 'Mar 3'),
  ((SELECT id FROM social_accounts WHERE platform='instagram' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'views', 4, 'Top Post #4', 'Post', 1100, 'Jan 19');

-- Favor International FB top content by views
INSERT INTO social_top_content (account_id, period_id, ranking_type, rank_position, content_title, content_type, metric_value, content_date) VALUES
  ((SELECT id FROM social_accounts WHERE platform='facebook' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'views', 1, 'Post #1', 'Post', 1879, 'Mar 31'),
  ((SELECT id FROM social_accounts WHERE platform='facebook' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'views', 2, 'Post #2', 'Post', 1020, 'Mar 26'),
  ((SELECT id FROM social_accounts WHERE platform='facebook' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'views', 3, 'Post #3', 'Post', 913, 'Mar 29'),
  ((SELECT id FROM social_accounts WHERE platform='facebook' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'views', 4, 'Post #4', 'Post', 740, 'Mar 30'),
  ((SELECT id FROM social_accounts WHERE platform='facebook' AND account_name='Favor International'), (SELECT id FROM reporting_periods WHERE label='2026-Q1'), 'views', 5, 'Post #5', 'Post', 393, 'Mar 27');

-- Upload log entries for seed data
INSERT INTO upload_log (uploaded_by, data_category, period_label, rows_imported, status, notes) VALUES
  ('claude', 'direct_mail', '2026-Q1', 3, 'success', 'Q1 2026 appeals from CSV'),
  ('claude', 'thank_you', '2026-Q1', 3, 'success', 'Q1 2026 TY receipts from CSV'),
  ('claude', 'email', '2026-Q1', 26, 'success', 'Q1 2026 newsletters from docx'),
  ('claude', 'social_media', '2026-Q1', 6, 'success', 'Q1 2026 social media from Master Report xlsx');
