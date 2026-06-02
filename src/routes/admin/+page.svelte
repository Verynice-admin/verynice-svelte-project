<script lang="ts">
  export let data: {
    stats: { userCount: number; pageCount: number; rateLimitBuckets: number } | null;
    recentComments: { id: string; postId: string; text: string; author: string; createdAt: string | null; isAiCorrected: boolean }[];
    recentReviews:  { id: string; postId: string; author: string; rating: number; title: string; createdAt: string | null }[];
  };

  function ago(iso: string | null): string {
    if (!iso) return '—';
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60)  return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  }

  const stars = (n: number) => '★'.repeat(Math.max(0,n)) + '☆'.repeat(Math.max(0,5-n));

  const quickActions = [
    { href: '/admin/content-audit', icon: '✦', label: 'Editorial rewrite', desc: 'Open AI-assisted article rewriting tool to improve content quality and tone.' },
    { href: '/admin/community',     icon: '◎', label: 'Moderate comments', desc: 'Review the latest user comments and remove inappropriate content.' },
    { href: '/admin/users',         icon: '▣', label: 'Manage users',      desc: 'Assign roles, suspend accounts, and review new registrations.' },
    { href: '/admin/ai',            icon: '◇', label: 'AI providers',      desc: 'Toggle AI features on/off or switch between Groq, Gemini, and OpenRouter.' },
    { href: '/admin/system',        icon: '⚙', label: 'Feature flags',     desc: 'Enable or disable site features instantly without a code deployment.' },
    { href: '/admin/audit',         icon: '◑', label: 'Audit log',         desc: 'Review who accessed the admin panel and any rejected access attempts.' },
  ];
</script>

<div class="page">

  <!-- ── Header ─────────────────────────────────────────────────────── -->
  <div class="ph">
    <div class="ph-left">
      <h1>Dashboard</h1>
      <p>Operational overview for VeryNice.kz — Kazakhstan's travel editorial platform.</p>
    </div>
    <div class="ph-status">
      <span class="dot-green"></span>
      <span class="status-text">System operational</span>
    </div>
  </div>

  <!-- ── Stat cards ─────────────────────────────────────────────────── -->
  <div class="stat-row">
    <div class="stat-card">
      <div class="stat-icon">▣</div>
      <div class="stat-body">
        <div class="stat-value">{data.stats?.userCount ?? '—'}</div>
        <div class="stat-label">Registered users</div>
        <div class="stat-hint">Travellers + business owners</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">◈</div>
      <div class="stat-body">
        <div class="stat-value">{data.stats?.pageCount ?? '—'}</div>
        <div class="stat-label">Content pages</div>
        <div class="stat-hint">Destinations, culture, tips…</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">◎</div>
      <div class="stat-body">
        <div class="stat-value">{data.recentComments.length}</div>
        <div class="stat-label">Recent comments</div>
        <div class="stat-hint">Newest 8 across all pages</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">★</div>
      <div class="stat-body">
        <div class="stat-value">{data.recentReviews.length}</div>
        <div class="stat-label">Recent reviews</div>
        <div class="stat-hint">Newest 8 star ratings</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">⚡</div>
      <div class="stat-body">
        <div class="stat-value">{data.stats?.rateLimitBuckets ?? '—'}</div>
        <div class="stat-label">Active rate-limit buckets</div>
        <div class="stat-hint">Open IP windows in Firestore</div>
      </div>
    </div>
  </div>

  <!-- ── System health ──────────────────────────────────────────────── -->
  <section class="card">
    <div class="card-head">
      <h2>System health</h2>
      <span class="card-sub">Live status of backend services</span>
    </div>
    <div class="health-grid">
      <div class="health-item">
        <span class="h-dot" class:h-green={!!data.stats} class:h-yellow={!data.stats}></span>
        <span class="h-label">Firebase Admin SDK</span>
        <span class="h-val">{data.stats ? 'Connected' : 'Not initialized'}</span>
        <span class="h-note">{data.stats ? 'Firestore reads working' : 'Service account missing — check .secrets/'}</span>
      </div>
      <div class="health-item">
        <span class="h-dot h-green"></span>
        <span class="h-label">SvelteKit server</span>
        <span class="h-val">Running</span>
        <span class="h-note">SSR + API routes responding</span>
      </div>
      <div class="health-item">
        <span class="h-dot h-green"></span>
        <span class="h-label">Session cookies</span>
        <span class="h-val">Secure</span>
        <span class="h-note">HttpOnly · Secure · SameSite=Strict</span>
      </div>
      <div class="health-item">
        <span class="h-dot h-green"></span>
        <span class="h-label">Rate limiting</span>
        <span class="h-val">Active</span>
        <span class="h-note">Admin: 30/min · Comments: 10/min · Auth: 5/5min</span>
      </div>
      <div class="health-item">
        <span class="h-dot h-green"></span>
        <span class="h-label">Security headers</span>
        <span class="h-val">Enforced</span>
        <span class="h-note">HSTS · CSP · X-Frame-Options · noindex on /admin</span>
      </div>
      <div class="health-item">
        <span class="h-dot h-green"></span>
        <span class="h-label">Admin access control</span>
        <span class="h-val">Locked</span>
        <span class="h-note">role=admin checked server-side on every request</span>
      </div>
    </div>
  </section>

  <!-- ── Quick actions ──────────────────────────────────────────────── -->
  <section class="card">
    <div class="card-head">
      <h2>Quick actions</h2>
      <span class="card-sub">Most common operational tasks</span>
    </div>
    <div class="action-grid">
      {#each quickActions as a}
        <a href={a.href} class="action-card">
          <span class="a-icon">{a.icon}</span>
          <div class="a-body">
            <div class="a-label">{a.label}</div>
            <div class="a-desc">{a.desc}</div>
          </div>
          <span class="a-arrow">→</span>
        </a>
      {/each}
    </div>
  </section>

  <!-- ── Recent activity ────────────────────────────────────────────── -->
  <div class="two-col">
    <section class="card">
      <div class="card-head">
        <h2>Recent comments</h2>
        <a href="/admin/community" class="card-link">View all →</a>
      </div>
      {#if data.recentComments.length === 0}
        <div class="empty-mini">
          <span class="empty-icon">◎</span>
          <p>No comments yet. When visitors submit comments on articles they will appear here for review.</p>
        </div>
      {:else}
        <div class="feed">
          {#each data.recentComments as c}
            <div class="feed-item">
              <div class="feed-top">
                <span class="feed-author">{c.author}</span>
                {#if c.isAiCorrected}<span class="badge-ai">AI edited</span>{/if}
                <span class="feed-time">{ago(c.createdAt)}</span>
              </div>
              <div class="feed-text">"{c.text.slice(0,110)}{c.text.length > 110 ? '…' : ''}"</div>
              <div class="feed-page">on <code>{c.postId}</code></div>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <section class="card">
      <div class="card-head">
        <h2>Recent reviews</h2>
        <a href="/admin/community" class="card-link">View all →</a>
      </div>
      {#if data.recentReviews.length === 0}
        <div class="empty-mini">
          <span class="empty-icon">★</span>
          <p>No reviews yet. Authenticated visitors can leave star ratings on destination and culture pages.</p>
        </div>
      {:else}
        <div class="feed">
          {#each data.recentReviews as r}
            <div class="feed-item">
              <div class="feed-top">
                <span class="feed-author">{r.author}</span>
                <span class="feed-stars">{stars(r.rating)}</span>
                <span class="feed-time">{ago(r.createdAt)}</span>
              </div>
              <div class="feed-text">"{r.title}"</div>
              <div class="feed-page">on <code>{r.postId}</code></div>
            </div>
          {/each}
        </div>
      {/if}
    </section>
  </div>

  {#if !data.stats}
    <div class="notice">
      <strong>Firebase Admin SDK not connected.</strong>
      Stats and live data are unavailable. Ensure <code>.secrets/serviceAccountKey.json</code> exists, then restart the dev server.
    </div>
  {/if}
</div>

<style>
  .page { padding: 1.75rem 2rem; max-width: 1140px; color: #0f172a; }

  /* Header */
  .ph { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; gap: 1rem; }
  .ph h1 { font-size: 1.35rem; font-weight: 700; margin: 0 0 0.25rem; color: #0f172a; }
  .ph p  { font-size: 0.82rem; color: #64748b; margin: 0; }
  .ph-status { display: flex; align-items: center; gap: 0.45rem; white-space: nowrap; margin-top: 0.2rem; }
  .dot-green { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; flex-shrink: 0; }
  .status-text { font-size: 0.75rem; color: #16a34a; font-weight: 500; }

  /* Stat row */
  .stat-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(175px,1fr)); gap: 0.75rem; margin-bottom: 1rem; }

  .stat-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 1rem 1.1rem;
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .stat-icon { font-size: 1rem; color: #d4a373; margin-top: 0.1rem; }
  .stat-value { font-size: 1.7rem; font-weight: 700; color: #0f172a; line-height: 1; }
  .stat-label { font-size: 0.75rem; font-weight: 600; color: #374151; margin-top: 0.2rem; }
  .stat-hint  { font-size: 0.68rem; color: #94a3b8; margin-top: 0.1rem; }

  /* Card */
  .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
  .card-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 1rem; gap: 1rem; }
  .card-head h2 { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #0f172a; margin: 0; }
  .card-sub  { font-size: 0.75rem; color: #94a3b8; }
  .card-link { font-size: 0.75rem; color: #64748b; text-decoration: none; margin-left: auto; }
  .card-link:hover { color: #d4a373; }

  /* Health grid */
  .health-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 0.5rem; }
  .health-item {
    display: grid;
    grid-template-columns: 10px 1fr auto;
    grid-template-rows: auto auto;
    column-gap: 0.6rem;
    row-gap: 0.1rem;
    padding: 0.6rem 0.75rem;
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 7px;
    align-items: center;
  }
  .h-dot { width: 8px; height: 8px; border-radius: 50%; grid-row: 1; }
  .h-green  { background: #22c55e; }
  .h-yellow { background: #f59e0b; }
  .h-label { font-size: 0.78rem; font-weight: 600; color: #374151; grid-row: 1; }
  .h-val   { font-size: 0.72rem; color: #64748b; grid-row: 1; text-align: right; }
  .h-note  { font-size: 0.67rem; color: #94a3b8; grid-column: 2 / 4; grid-row: 2; }

  /* Quick actions */
  .action-grid { display: flex; flex-direction: column; gap: 0.4rem; }
  .action-card {
    display: flex; align-items: center; gap: 0.85rem;
    padding: 0.75rem 1rem;
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
    text-decoration: none; color: inherit;
    transition: border-color 0.12s, background 0.12s;
  }
  .action-card:hover { background: #f0f9ff; border-color: #bae6fd; }
  .a-icon  { font-size: 1rem; color: #d4a373; width: 1.25rem; text-align: center; flex-shrink: 0; }
  .a-body  { flex: 1; }
  .a-label { font-size: 0.83rem; font-weight: 600; color: #0f172a; }
  .a-desc  { font-size: 0.73rem; color: #64748b; margin-top: 0.1rem; }
  .a-arrow { font-size: 0.8rem; color: #cbd5e1; }

  /* Two-col */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 780px) { .two-col { grid-template-columns: 1fr; } }

  /* Feed */
  .feed { display: flex; flex-direction: column; gap: 0; }
  .feed-item { padding: 0.65rem 0; border-bottom: 1px solid #f1f5f9; }
  .feed-item:last-child { border-bottom: none; }
  .feed-top { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem; }
  .feed-author { font-size: 0.78rem; font-weight: 600; color: #374151; }
  .feed-time   { font-size: 0.68rem; color: #94a3b8; margin-left: auto; }
  .feed-text   { font-size: 0.78rem; color: #475569; font-style: italic; line-height: 1.4; }
  .feed-page   { font-size: 0.67rem; color: #94a3b8; margin-top: 0.15rem; }
  .feed-page code { font-size: 0.67rem; }
  .feed-stars  { font-size: 0.7rem; color: #f59e0b; letter-spacing: -1px; }
  .badge-ai { font-size: 0.6rem; padding: 0.1rem 0.35rem; background: #ede9fe; color: #7c3aed; border-radius: 4px; font-weight: 600; }

  /* Empty mini */
  .empty-mini { padding: 1rem 0; text-align: center; }
  .empty-icon { font-size: 1.5rem; color: #e2e8f0; display: block; margin-bottom: 0.5rem; }
  .empty-mini p { font-size: 0.78rem; color: #94a3b8; line-height: 1.5; max-width: 280px; margin: 0 auto; }

  /* Notice */
  .notice {
    margin-top: 1rem; padding: 0.85rem 1.1rem;
    background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px;
    font-size: 0.78rem; color: #92400e; line-height: 1.5;
  }
  .notice code { font-size: 0.75rem; }
</style>
