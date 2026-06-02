<script lang="ts">
  export let data: {
    entries: {
      id: string; uid: string; path: string; ip: string;
      action: 'access' | 'action' | 'rejected';
      detail?: string; timestamp: string | null;
    }[];
  };

  let filterAction: 'all' | 'access' | 'action' | 'rejected' = 'all';

  $: filtered = filterAction === 'all' ? data.entries : data.entries.filter(e => e.action === filterAction);

  $: counts = {
    access:   data.entries.filter(e => e.action === 'access').length,
    action:   data.entries.filter(e => e.action === 'action').length,
    rejected: data.entries.filter(e => e.action === 'rejected').length,
  };

  const ACTION_BADGE: Record<string, string> = {
    access:   'b-access',
    action:   'b-action',
    rejected: 'b-rejected',
  };

  function fmt(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  }

  function shortUid(uid: string): string {
    return uid.length > 20 ? uid.slice(0, 10) + '…' + uid.slice(-6) : uid;
  }
</script>

<div class="page">

  <!-- ── Header ─────────────────────────────────────────────────────── -->
  <div class="ph">
    <h1>Audit Log</h1>
    <p>A tamper-evident record of who accessed the admin panel, when, from which IP, and whether they were admitted or rejected.</p>
  </div>

  <!-- ── What this is ───────────────────────────────────────────────── -->
  <div class="info-row">
    <div class="info-card">
      <span class="info-icon">◑</span>
      <div>
        <div class="info-title">What is logged</div>
        <div class="info-body">Every request that reaches the admin layout server records: the authenticated UID, the URL path, the visitor's IP address, whether access was granted or rejected, and a timestamp from Firestore's server clock. Log entries cannot be edited.</div>
      </div>
    </div>
    <div class="info-card">
      <span class="info-icon">🚫</span>
      <div>
        <div class="info-title">Rejected entries</div>
        <div class="info-body">A <strong>rejected</strong> entry means someone tried to access <code>/admin</code> with a valid session cookie but the wrong role (e.g. role = "business"). This indicates a misconfigured account or a privilege escalation attempt. Investigate any cluster of rejections from the same IP.</div>
      </div>
    </div>
    <div class="info-card">
      <span class="info-icon">🔧</span>
      <div>
        <div class="info-title">Dev mode behaviour</div>
        <div class="info-body">Audit log writes are skipped in development (<code>dev = true</code>) to prevent polluting the production Firestore log with local test activity. This is why the log appears empty when running locally. In production, entries appear immediately after each admin page load.</div>
      </div>
    </div>
  </div>

  <!-- ── Stats bar ──────────────────────────────────────────────────── -->
  {#if data.entries.length > 0}
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-num">{data.entries.length}</span>
        <span class="stat-lbl">Total entries (last 200)</span>
      </div>
      <div class="stat-item">
        <span class="stat-num stat-ok">{counts.access}</span>
        <span class="stat-lbl">Successful accesses</span>
      </div>
      <div class="stat-item">
        <span class="stat-num stat-info">{counts.action}</span>
        <span class="stat-lbl">Admin actions</span>
      </div>
      <div class="stat-item">
        <span class="stat-num" class:stat-warn={counts.rejected > 0}>{counts.rejected}</span>
        <span class="stat-lbl">Rejected attempts</span>
      </div>
    </div>
  {/if}

  <!-- ── Filter tabs ────────────────────────────────────────────────── -->
  {#if data.entries.length > 0}
    <div class="toolbar">
      <div class="tabs">
        {#each [
          { val: 'all',      label: 'All',      count: data.entries.length },
          { val: 'access',   label: 'Access',   count: counts.access },
          { val: 'action',   label: 'Action',   count: counts.action },
          { val: 'rejected', label: 'Rejected', count: counts.rejected },
        ] as t}
          <button
            class="tab"
            class:active={filterAction === t.val}
            onclick={() => filterAction = t.val as typeof filterAction}
          >
            {t.label}
            <span class="tab-count" class:tc-danger={t.val === 'rejected' && t.count > 0}>{t.count}</span>
          </button>
        {/each}
      </div>
      <span class="result-count">{filtered.length} shown</span>
    </div>
  {/if}

  <!-- ── Table or empty ─────────────────────────────────────────────── -->
  {#if data.entries.length === 0}
    <div class="empty-state">
      <div class="empty-icon">◑</div>
      <h3>No audit entries yet</h3>
      <p>This is expected in development. Audit log writes are intentionally skipped when running locally (<code>dev = true</code>) to keep the production log clean.</p>
      <p>In production, every admin page visit automatically generates an entry here — successful accesses in <span class="badge-inline b-access">green</span>, rejected attempts in <span class="badge-inline b-rejected">red</span>.</p>
      <div class="empty-checklist">
        <div class="check-item">
          <span class="check-ok">✓</span>
          <span>Audit logging code is active in <code>+layout.server.ts</code></span>
        </div>
        <div class="check-item">
          <span class="check-ok">✓</span>
          <span>Entries are written to <code>adminAuditLog</code> collection in Firestore</span>
        </div>
        <div class="check-item">
          <span class="check-ok">✓</span>
          <span>Production entries will appear here automatically</span>
        </div>
        <div class="check-item">
          <span class="check-mute">○</span>
          <span>Dev mode writes are skipped (by design)</span>
        </div>
      </div>
    </div>
  {:else if filtered.length === 0}
    <div class="empty-state small">
      <p>No entries match this filter.</p>
    </div>
  {:else}
    <div class="table-wrap">
      <div class="table-head audit-grid">
        <span>Timestamp</span>
        <span>Action</span>
        <span>Path</span>
        <span>UID</span>
        <span>IP</span>
        <span>Detail</span>
      </div>
      {#each filtered as e (e.id)}
        <div class="table-row audit-grid" class:row-rejected={e.action === 'rejected'}>
          <span class="cell-ts">{fmt(e.timestamp)}</span>
          <span><span class="badge {ACTION_BADGE[e.action]}">{e.action}</span></span>
          <span class="cell-path" title={e.path}>{e.path}</span>
          <span class="cell-uid" title={e.uid}>{shortUid(e.uid)}</span>
          <span class="cell-ip">{e.ip}</span>
          <span class="cell-detail">{e.detail ?? ''}</span>
        </div>
      {/each}
    </div>
    <p class="table-note">Showing newest 200 entries. Older entries remain in Firestore but are not displayed here.</p>
  {/if}
</div>

<style>
  .page { padding: 1.75rem 2rem; max-width: 1200px; color: #0f172a; }

  .ph { margin-bottom: 1.25rem; }
  .ph h1 { font-size: 1.35rem; font-weight: 700; margin: 0 0 0.25rem; }
  .ph p  { font-size: 0.82rem; color: #64748b; margin: 0; }

  /* Info row */
  .info-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px,1fr)); gap: 0.75rem; margin-bottom: 1.25rem; }
  .info-card { display: flex; gap: 0.75rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem 1.1rem; }
  .info-icon  { font-size: 1.2rem; flex-shrink: 0; margin-top: 0.1rem; }
  .info-title { font-size: 0.8rem; font-weight: 700; color: #0f172a; margin-bottom: 0.3rem; }
  .info-body  { font-size: 0.75rem; color: #64748b; line-height: 1.55; }
  .info-body code { font-size: 0.7rem; }
  .info-body strong { color: #374151; }

  /* Stats bar */
  .stats-bar {
    display: flex; gap: 0; background: #fff;
    border: 1px solid #e2e8f0; border-radius: 10px;
    overflow: hidden; margin-bottom: 1rem;
  }
  .stat-item {
    flex: 1; padding: 0.85rem 1.25rem;
    border-right: 1px solid #f1f5f9;
    display: flex; flex-direction: column; gap: 0.15rem;
  }
  .stat-item:last-child { border-right: none; }
  .stat-num  { font-size: 1.5rem; font-weight: 700; color: #0f172a; line-height: 1; }
  .stat-ok   { color: #16a34a; }
  .stat-info { color: #2563eb; }
  .stat-warn { color: #dc2626; }
  .stat-lbl  { font-size: 0.68rem; color: #94a3b8; font-weight: 500; }

  /* Toolbar */
  .toolbar { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
  .tabs { display: flex; background: #f1f5f9; border-radius: 7px; padding: 3px; gap: 2px; }
  .tab {
    display: flex; align-items: center; gap: 0.4rem;
    padding: 0.35rem 0.85rem; border: none; border-radius: 5px;
    cursor: pointer; font-size: 0.78rem; font-weight: 500;
    background: transparent; color: #64748b;
    transition: background 0.1s, color 0.1s;
  }
  .tab.active { background: #fff; color: #0f172a; box-shadow: 0 1px 3px #0001; }
  .tab-count {
    font-size: 0.65rem; background: #e2e8f0; color: #64748b;
    padding: 0.05rem 0.4rem; border-radius: 10px; font-weight: 600;
  }
  .tc-danger { background: #fee2e2; color: #dc2626; }
  .result-count { font-size: 0.72rem; color: #94a3b8; margin-left: auto; }

  /* Table */
  .table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
  .audit-grid { grid-template-columns: 165px 80px 1fr 140px 115px 170px; }
  .table-head {
    display: grid; gap: 0.5rem; padding: 0.55rem 1rem;
    background: #f8fafc; border-bottom: 1px solid #e2e8f0;
    font-size: 0.67rem; font-weight: 700; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.07em;
  }
  .table-row {
    display: grid; gap: 0.5rem; padding: 0.6rem 1rem;
    border-bottom: 1px solid #f1f5f9; align-items: center;
    font-size: 0.78rem;
  }
  .table-row:last-child { border-bottom: none; }
  .table-row:hover { background: #fafafa; }
  .row-rejected { background: #fff8f8; }

  .cell-ts     { color: #64748b; font-size: 0.72rem; font-variant-numeric: tabular-nums; }
  .cell-path   { color: #374151; font-family: monospace; font-size: 0.73rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cell-uid    { color: #94a3b8; font-family: monospace; font-size: 0.7rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cell-ip     { color: #64748b; font-family: monospace; font-size: 0.72rem; }
  .cell-detail { color: #94a3b8; font-size: 0.71rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .badge { display: inline-block; font-size: 0.65rem; padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 600; }
  .b-access   { background: #dcfce7; color: #15803d; }
  .b-action   { background: #dbeafe; color: #1d4ed8; }
  .b-rejected { background: #fee2e2; color: #dc2626; }

  .table-note { font-size: 0.7rem; color: #94a3b8; margin-top: 0.6rem; }

  /* Empty state */
  .empty-state {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
    padding: 2.5rem 2rem; text-align: center;
  }
  .empty-state.small { padding: 1.5rem 2rem; }
  .empty-icon { font-size: 2rem; color: #e2e8f0; display: block; margin-bottom: 0.75rem; }
  .empty-state h3 { font-size: 1rem; font-weight: 700; color: #374151; margin: 0 0 0.5rem; }
  .empty-state p  { font-size: 0.8rem; color: #64748b; max-width: 480px; margin: 0 auto 0.5rem; line-height: 1.55; }
  .empty-state p code { font-size: 0.72rem; }

  .badge-inline { display: inline; font-size: 0.72rem; padding: 0.08rem 0.35rem; border-radius: 3px; font-weight: 600; }

  .empty-checklist { margin: 1.25rem auto 0; max-width: 420px; text-align: left; display: flex; flex-direction: column; gap: 0.4rem; }
  .check-item { display: flex; align-items: flex-start; gap: 0.6rem; font-size: 0.77rem; color: #64748b; }
  .check-item code { font-size: 0.7rem; }
  .check-ok   { color: #22c55e; font-weight: 700; flex-shrink: 0; }
  .check-mute { color: #94a3b8; flex-shrink: 0; }
</style>
