import {
  hashPassword, verifyPassword, generateSessionId,
  getSessionCookie, clearSessionCookie, validateSession,
} from '../lib/auth';

interface Env { DB: D1Database; }

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const path = (params.route as string[]).join('/');
  const method = request.method;
  const db = env.DB;

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  try {
    // ============================================================
    // AUTH ROUTES
    // ============================================================
    if (path === 'auth/setup' && method === 'POST') {
      const existing = await db.prepare('SELECT COUNT(*) as cnt FROM users').first<{ cnt: number }>();
      if (existing && existing.cnt > 0) return json({ error: 'Setup already completed' }, 400);
      const body = await request.json() as { username: string; password: string; name: string };
      const hash = await hashPassword(body.password);
      const result = await db.prepare(
        'INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)'
      ).bind(body.username, hash, body.name, 'admin').run();
      const userId = result.meta.last_row_id;
      const sessionId = generateSessionId();
      await db.prepare(
        "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+7 days'))"
      ).bind(sessionId, userId).run();
      return json(
        { user: { id: userId, username: body.username, name: body.name, role: 'admin' } },
        200,
        { 'Set-Cookie': getSessionCookie(sessionId) }
      );
    }

    if (path === 'auth/login' && method === 'POST') {
      const body = await request.json() as { username: string; password: string };
      const row = await db.prepare('SELECT * FROM users WHERE username = ?').bind(body.username)
        .first<{ id: number; username: string; password_hash: string; name: string; role: string }>();
      if (!row || !(await verifyPassword(body.password, row.password_hash))) {
        return json({ error: 'Invalid credentials' }, 401);
      }
      const sessionId = generateSessionId();
      await db.prepare(
        "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+7 days'))"
      ).bind(sessionId, row.id).run();
      return json(
        { user: { id: row.id, username: row.username, name: row.name, role: row.role } },
        200,
        { 'Set-Cookie': getSessionCookie(sessionId) }
      );
    }

    if (path === 'auth/logout' && method === 'POST') {
      return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie() });
    }

    if (path === 'auth/me' && method === 'GET') {
      return json({ user });
    }

    // ============================================================
    // PERIODS
    // ============================================================
    if (path === 'periods' && method === 'GET') {
      const includeAll = url.searchParams.get('all') === 'true';
      const query = includeAll
        ? 'SELECT * FROM reporting_periods ORDER BY year DESC, quarter DESC, month DESC'
        : 'SELECT * FROM reporting_periods WHERE year >= 2026 ORDER BY year DESC, quarter DESC, month DESC';
      const rows = await db.prepare(query).all();
      return json({ periods: rows.results });
    }

    if (path === 'periods' && method === 'POST') {

      const body = await request.json() as { year: number; quarter: number; month?: number };
      const label = body.month
        ? `${body.year}-${String(body.month).padStart(2, '0')}`
        : `${body.year}-Q${body.quarter}`;
      const result = await db.prepare(
        'INSERT OR IGNORE INTO reporting_periods (year, quarter, month, label) VALUES (?, ?, ?, ?)'
      ).bind(body.year, body.quarter, body.month || null, label).run();
      const id = result.meta.last_row_id;
      return json({ period: { id, year: body.year, quarter: body.quarter, month: body.month || null, label } });
    }

    // ============================================================
    // ACCOUNTS
    // ============================================================
    if (path === 'accounts' && method === 'GET') {
      const rows = await db.prepare('SELECT * FROM social_accounts ORDER BY platform, account_name').all();
      return json({ accounts: rows.results });
    }

    // ============================================================
    // DASHBOARD SUMMARY
    // ============================================================
    if (path === 'dashboard/summary' && method === 'GET') {
      const periodId = url.searchParams.get('period_id');
      let periodClause = '';
      const binds: unknown[] = [];

      if (periodId) {
        periodClause = 'AND period_id = ?';
        binds.push(parseInt(periodId));
      } else {
        // Get most recent period
        const latest = await db.prepare('SELECT id FROM reporting_periods ORDER BY year DESC, quarter DESC, month DESC LIMIT 1').first<{ id: number }>();
        if (latest) {
          periodClause = 'AND period_id = ?';
          binds.push(latest.id);
        }
      }

      const social = await db.prepare(
        `SELECT COALESCE(SUM(total_followers), 0) as totalFollowers,
                COALESCE(SUM(total_views), 0) as totalViews,
                COALESCE(SUM(total_interactions), 0) as totalInteractions,
                COALESCE(SUM(net_follower_growth), 0) as followerGrowth
         FROM social_metrics WHERE 1=1 ${periodClause}`
      ).bind(...binds).first() || { totalFollowers: 0, totalViews: 0, totalInteractions: 0, followerGrowth: 0 };

      const mail = await db.prepare(
        `SELECT COALESCE(SUM(total_given), 0) as totalGiven,
                COALESCE(SUM(gifts), 0) as totalGifts,
                CASE WHEN SUM(gifts) > 0 THEN SUM(total_given) / SUM(gifts) ELSE 0 END as avgPerGift,
                COUNT(*) as totalAppeals
         FROM direct_mail_appeals WHERE 1=1 ${periodClause}`
      ).bind(...binds).first() || { totalGiven: 0, totalGifts: 0, avgPerGift: 0, totalAppeals: 0 };

      const email = await db.prepare(
        `SELECT CASE WHEN SUM(recipients) > 0 THEN (CAST(SUM(opens) AS REAL) / SUM(recipients)) * 100 ELSE 0 END as avgOpenRate,
                CASE WHEN SUM(recipients) > 0 THEN (CAST(SUM(clicks) AS REAL) / SUM(recipients)) * 100 ELSE 0 END as avgClickRate,
                COALESCE(SUM(total_raised), 0) as totalRaised,
                COALESCE(SUM(recipients), 0) as totalSent
         FROM email_newsletters WHERE is_resend = 0 ${periodClause}`
      ).bind(...binds).first() || { avgOpenRate: 0, avgClickRate: 0, totalRaised: 0, totalSent: 0 };

      const thankyou = await db.prepare(
        `SELECT COALESCE(SUM(gifts), 0) as totalGifts,
                COALESCE(SUM(donors), 0) as totalDonors,
                COALESCE(SUM(total_given), 0) as totalGiven,
                CASE WHEN SUM(gifts) > 0 THEN SUM(total_given) / SUM(gifts) ELSE 0 END as avgPerGift
         FROM thank_you_receipts WHERE 1=1 ${periodClause}`
      ).bind(...binds).first() || { totalGifts: 0, totalDonors: 0, totalGiven: 0, avgPerGift: 0 };

      let currentPeriod = null;
      if (binds.length > 0) {
        currentPeriod = await db.prepare('SELECT * FROM reporting_periods WHERE id = ?').bind(binds[0]).first();
      }

      return json({ social, mail, email, thankyou, currentPeriod });
    }

    // ============================================================
    // DASHBOARD DETAIL ROUTES
    // ============================================================
    if (path === 'dashboard/social' && method === 'GET') {
      const accountId = parseInt(url.searchParams.get('account_id') || '0');
      const pid = parseInt(url.searchParams.get('period_id') || '0');
      if (!accountId || !pid) return json({ error: 'account_id and period_id required' }, 400);

      const metrics = await db.prepare(
        'SELECT * FROM social_metrics WHERE account_id = ? AND period_id = ?'
      ).bind(accountId, pid).first();

      const topContent = await db.prepare(
        'SELECT * FROM social_top_content WHERE account_id = ? AND period_id = ? ORDER BY ranking_type, rank_position'
      ).bind(accountId, pid).all();

      const demographics = await db.prepare(
        'SELECT * FROM social_demographics WHERE account_id = ? AND period_id = ? ORDER BY demo_type, percentage DESC'
      ).bind(accountId, pid).all();

      // Parse JSON field
      let parsed = metrics;
      if (parsed && typeof (parsed as Record<string, unknown>).views_by_content_type === 'string') {
        try {
          (parsed as Record<string, unknown>).views_by_content_type = JSON.parse(
            (parsed as Record<string, unknown>).views_by_content_type as string
          );
        } catch { /* leave as-is */ }
      }

      return json({ metrics: parsed || null, topContent: topContent.results, demographics: demographics.results });
    }

    if (path === 'dashboard/mail' && method === 'GET') {
      const pid = parseInt(url.searchParams.get('period_id') || '0');
      if (!pid) return json({ error: 'period_id required' }, 400);
      const rows = await db.prepare('SELECT * FROM direct_mail_appeals WHERE period_id = ? ORDER BY appeal_id').bind(pid).all();

      // YoY: find the same quarter from previous year
      const currentPeriod = await db.prepare('SELECT * FROM reporting_periods WHERE id = ?').bind(pid).first<{ year: number; quarter: number }>();
      let yoyAppeals: unknown[] = [];
      let yoyPeriodLabel = '';
      if (currentPeriod) {
        const prevPeriod = await db.prepare(
          'SELECT * FROM reporting_periods WHERE year = ? AND quarter = ? AND month IS NULL'
        ).bind(currentPeriod.year - 1, currentPeriod.quarter).first<{ id: number; label: string }>();
        if (prevPeriod) {
          const prevRows = await db.prepare('SELECT * FROM direct_mail_appeals WHERE period_id = ? ORDER BY appeal_id').bind(prevPeriod.id).all();
          yoyAppeals = prevRows.results;
          yoyPeriodLabel = prevPeriod.label;
        }
      }

      return json({ appeals: rows.results, yoy: { appeals: yoyAppeals, periodLabel: yoyPeriodLabel } });
    }

    if (path === 'dashboard/email' && method === 'GET') {
      const pid = parseInt(url.searchParams.get('period_id') || '0');
      if (!pid) return json({ error: 'period_id required' }, 400);
      const rows = await db.prepare('SELECT * FROM email_newsletters WHERE period_id = ? ORDER BY date_sent DESC').bind(pid).all();

      // YoY for email
      const currentPeriod = await db.prepare('SELECT * FROM reporting_periods WHERE id = ?').bind(pid).first<{ year: number; quarter: number }>();
      let yoySummary = null;
      if (currentPeriod) {
        const prevPeriod = await db.prepare(
          'SELECT * FROM reporting_periods WHERE year = ? AND quarter = ? AND month IS NULL'
        ).bind(currentPeriod.year - 1, currentPeriod.quarter).first<{ id: number; label: string }>();
        if (prevPeriod) {
          const prev = await db.prepare(
            `SELECT COALESCE(SUM(recipients),0) as recipients, COALESCE(SUM(opens),0) as opens,
             COALESCE(SUM(clicks),0) as clicks, COALESCE(SUM(total_raised),0) as totalRaised,
             COALESCE(SUM(transactions),0) as gifts
             FROM email_newsletters WHERE period_id = ? AND is_resend = 0`
          ).bind(prevPeriod.id).first();
          yoySummary = { ...prev, periodLabel: prevPeriod.label };
        }
      }

      return json({ newsletters: rows.results, yoy: yoySummary });
    }

    if (path === 'dashboard/thankyou' && method === 'GET') {
      const pid = parseInt(url.searchParams.get('period_id') || '0');
      if (!pid) return json({ error: 'period_id required' }, 400);
      const rows = await db.prepare('SELECT * FROM thank_you_receipts WHERE period_id = ? ORDER BY appeal_id').bind(pid).all();

      // YoY for TY receipts
      const currentPeriod = await db.prepare('SELECT * FROM reporting_periods WHERE id = ?').bind(pid).first<{ year: number; quarter: number }>();
      let yoySummary = null;
      if (currentPeriod) {
        const prevPeriod = await db.prepare(
          'SELECT * FROM reporting_periods WHERE year = ? AND quarter = ? AND month IS NULL'
        ).bind(currentPeriod.year - 1, currentPeriod.quarter).first<{ id: number; label: string }>();
        if (prevPeriod) {
          const prev = await db.prepare(
            `SELECT COALESCE(SUM(gifts),0) as gifts, COALESCE(SUM(donors),0) as donors,
             COALESCE(SUM(total_given),0) as totalGiven, COALESCE(SUM(num_solicitors),0) as receiptsMailed,
             COALESCE(SUM(total_cost),0) as totalCost
             FROM thank_you_receipts WHERE period_id = ?`
          ).bind(prevPeriod.id).first();
          yoySummary = { ...prev, periodLabel: prevPeriod.label };
        }
      }

      return json({ receipts: rows.results, yoy: yoySummary });
    }

    if (path === 'dashboard/trends' && method === 'GET') {
      const category = url.searchParams.get('category') || '';
      const metric = url.searchParams.get('metric') || '';
      const limit = parseInt(url.searchParams.get('limit') || '12');

      let query = '';
      if (category === 'mail' && metric === 'total_given') {
        query = `SELECT rp.label as period_label, COALESCE(SUM(d.total_given), 0) as value
                 FROM reporting_periods rp LEFT JOIN direct_mail_appeals d ON d.period_id = rp.id
                 GROUP BY rp.id ORDER BY rp.year DESC, rp.quarter DESC, rp.month DESC LIMIT ?`;
      } else if (category === 'social' && metric === 'total_views') {
        query = `SELECT rp.label as period_label, COALESCE(SUM(s.total_views), 0) as value
                 FROM reporting_periods rp LEFT JOIN social_metrics s ON s.period_id = rp.id
                 GROUP BY rp.id ORDER BY rp.year DESC, rp.quarter DESC, rp.month DESC LIMIT ?`;
      } else if (category === 'thankyou' && metric === 'total_given') {
        query = `SELECT rp.label as period_label, COALESCE(SUM(t.total_given), 0) as value
                 FROM reporting_periods rp LEFT JOIN thank_you_receipts t ON t.period_id = rp.id
                 GROUP BY rp.id ORDER BY rp.year DESC, rp.quarter DESC, rp.month DESC LIMIT ?`;
      } else {
        return json({ data: [] });
      }

      const rows = await db.prepare(query).bind(limit).all();
      return json({ data: rows.results.reverse() });
    }

    // ============================================================
    // DATA INGESTION (called by Claude or admin)
    // ============================================================
    if (path === 'data/social' && method === 'POST') {

      const body = await request.json() as {
        account_id: number; period_id: number; metrics: Record<string, unknown>;
        top_content?: Record<string, unknown>[]; demographics?: Record<string, unknown>[];
      };

      // Upsert metrics
      const m = body.metrics;
      await db.prepare(
        `INSERT OR REPLACE INTO social_metrics (account_id, period_id, total_views, three_sec_views, one_min_views,
          accounts_reached, views_change_pct, views_by_content_type, follower_views_pct, non_follower_views_pct,
          total_interactions, interactions_from_followers_pct, interactions_from_non_followers_pct,
          likes, comments, saves, shares, reposts,
          total_profile_activity, profile_visits, external_link_taps, profile_activity_change_pct,
          total_followers, net_follower_growth, new_follows, unfollows, followers_change_pct,
          gender_male_pct, gender_female_pct)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        body.account_id, body.period_id,
        m.total_views ?? null, m.three_sec_views ?? null, m.one_min_views ?? null,
        m.accounts_reached ?? null, m.views_change_pct ?? null,
        typeof m.views_by_content_type === 'object' ? JSON.stringify(m.views_by_content_type) : m.views_by_content_type ?? null,
        m.follower_views_pct ?? null, m.non_follower_views_pct ?? null,
        m.total_interactions ?? null, m.interactions_from_followers_pct ?? null, m.interactions_from_non_followers_pct ?? null,
        m.likes ?? null, m.comments ?? null, m.saves ?? null, m.shares ?? null, m.reposts ?? null,
        m.total_profile_activity ?? null, m.profile_visits ?? null, m.external_link_taps ?? null, m.profile_activity_change_pct ?? null,
        m.total_followers ?? null, m.net_follower_growth ?? null, m.new_follows ?? null, m.unfollows ?? null, m.followers_change_pct ?? null,
        m.gender_male_pct ?? null, m.gender_female_pct ?? null,
      ).run();

      // Insert top content
      if (body.top_content?.length) {
        await db.prepare('DELETE FROM social_top_content WHERE account_id = ? AND period_id = ?').bind(body.account_id, body.period_id).run();
        for (const tc of body.top_content) {
          await db.prepare(
            'INSERT INTO social_top_content (account_id, period_id, ranking_type, rank_position, content_title, content_type, metric_value, content_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(body.account_id, body.period_id, tc.ranking_type, tc.rank_position, tc.content_title ?? null, tc.content_type ?? null, tc.metric_value ?? null, tc.content_date ?? null).run();
        }
      }

      // Insert demographics
      if (body.demographics?.length) {
        await db.prepare('DELETE FROM social_demographics WHERE account_id = ? AND period_id = ?').bind(body.account_id, body.period_id).run();
        for (const d of body.demographics) {
          await db.prepare(
            'INSERT INTO social_demographics (account_id, period_id, demo_type, demo_value, percentage, male_pct, female_pct) VALUES (?, ?, ?, ?, ?, ?, ?)'
          ).bind(body.account_id, body.period_id, d.demo_type, d.demo_value, d.percentage ?? null, d.male_pct ?? null, d.female_pct ?? null).run();
        }
      }

      await db.prepare(
        "INSERT INTO upload_log (uploaded_by, data_category, period_label, rows_imported, status) VALUES (?, 'social_media', ?, 1, 'success')"
      ).bind('api', `account_${body.account_id}_period_${body.period_id}`).run();

      return json({ ok: true });
    }

    if (path === 'data/mail' && method === 'POST') {

      const body = await request.json() as { period_id: number; appeals: Record<string, unknown>[] };
      let count = 0;
      for (const a of body.appeals) {
        await db.prepare(
          `INSERT OR REPLACE INTO direct_mail_appeals (period_id, appeal_id, description, topic_audience,
            num_solicitors, gifts, donors, response_pct, total_given, avg_per_gift, avg_per_donor,
            goal, over_under, total_cost, cost_per_gift, cost_per_donor, brm_returns_cost, profit_loss, package_cost)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          body.period_id, a.appeal_id, a.description ?? null, a.topic_audience ?? null,
          a.num_solicitors ?? null, a.gifts ?? null, a.donors ?? null, a.response_pct ?? null,
          a.total_given ?? null, a.avg_per_gift ?? null, a.avg_per_donor ?? null,
          a.goal ?? null, a.over_under ?? null, a.total_cost ?? null,
          a.cost_per_gift ?? null, a.cost_per_donor ?? null, a.brm_returns_cost ?? null,
          a.profit_loss ?? null, a.package_cost ?? null,
        ).run();
        count++;
      }
      const periodLabel = await db.prepare('SELECT label FROM reporting_periods WHERE id = ?').bind(body.period_id).first<{ label: string }>();
      await db.prepare(
        "INSERT INTO upload_log (uploaded_by, data_category, period_label, rows_imported, status) VALUES (?, 'direct_mail', ?, ?, 'success')"
      ).bind('api', periodLabel?.label || '', count).run();
      return json({ ok: true, imported: count });
    }

    if (path === 'data/email' && method === 'POST') {

      const body = await request.json() as { period_id: number; newsletters: Record<string, unknown>[] };
      let count = 0;
      for (const n of body.newsletters) {
        await db.prepare(
          `INSERT INTO email_newsletters (period_id, name, status, subject_line, audience_list, date_sent,
            is_resend, recipients, opens, clicks, transactions, total_raised, bounces, unsubscribes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          body.period_id, n.name, n.status ?? null, n.subject_line ?? null, n.audience_list ?? null,
          n.date_sent ?? null, n.is_resend ? 1 : 0,
          n.recipients ?? null, n.opens ?? null, n.clicks ?? null,
          n.transactions ?? null, n.total_raised ?? null, n.bounces ?? null, n.unsubscribes ?? null,
        ).run();
        count++;
      }
      const periodLabel = await db.prepare('SELECT label FROM reporting_periods WHERE id = ?').bind(body.period_id).first<{ label: string }>();
      await db.prepare(
        "INSERT INTO upload_log (uploaded_by, data_category, period_label, rows_imported, status) VALUES (?, 'email', ?, ?, 'success')"
      ).bind('api', periodLabel?.label || '', count).run();
      return json({ ok: true, imported: count });
    }

    if (path === 'data/thankyou' && method === 'POST') {

      const body = await request.json() as { period_id: number; receipts: Record<string, unknown>[] };
      let count = 0;
      for (const r of body.receipts) {
        await db.prepare(
          `INSERT OR REPLACE INTO thank_you_receipts (period_id, appeal_id, description, num_solicitors,
            gifts, donors, response_pct, total_given, avg_per_gift, avg_per_donor,
            goal, over_under, total_cost, cost_per_gift, cost_per_donor)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          body.period_id, r.appeal_id, r.description ?? null, r.num_solicitors ?? null,
          r.gifts ?? null, r.donors ?? null, r.response_pct ?? null,
          r.total_given ?? null, r.avg_per_gift ?? null, r.avg_per_donor ?? null,
          r.goal ?? null, r.over_under ?? null, r.total_cost ?? null,
          r.cost_per_gift ?? null, r.cost_per_donor ?? null,
        ).run();
        count++;
      }
      const periodLabel = await db.prepare('SELECT label FROM reporting_periods WHERE id = ?').bind(body.period_id).first<{ label: string }>();
      await db.prepare(
        "INSERT INTO upload_log (uploaded_by, data_category, period_label, rows_imported, status) VALUES (?, 'thank_you', ?, ?, 'success')"
      ).bind('api', periodLabel?.label || '', count).run();
      return json({ ok: true, imported: count });
    }

    // ============================================================
    // DATA DELETE
    // ============================================================
    if (path.startsWith('data/') && method === 'DELETE') {

      const parts = path.split('/');
      const category = parts[1];
      const pid = parseInt(parts[2]);
      if (!pid) return json({ error: 'Invalid period_id' }, 400);

      const tableMap: Record<string, string> = {
        social_media: 'social_metrics',
        direct_mail: 'direct_mail_appeals',
        email: 'email_newsletters',
        thank_you: 'thank_you_receipts',
      };
      const table = tableMap[category];
      if (!table) return json({ error: 'Invalid category' }, 400);

      await db.prepare(`DELETE FROM ${table} WHERE period_id = ?`).bind(pid).run();
      if (category === 'social_media') {
        await db.prepare('DELETE FROM social_top_content WHERE period_id = ?').bind(pid).run();
        await db.prepare('DELETE FROM social_demographics WHERE period_id = ?').bind(pid).run();
      }
      return json({ ok: true });
    }

    // ============================================================
    // UPLOADS LOG
    // ============================================================
    if (path === 'uploads' && method === 'GET') {
      const rows = await db.prepare('SELECT * FROM upload_log ORDER BY created_at DESC LIMIT 100').all();
      return json({ uploads: rows.results });
    }

    return json({ error: 'Not found' }, 404);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return json({ error: message }, 500);
  }
};
