<script lang="ts">
  import { enhance } from '$app/forms';

  export let form: { success?: boolean; error?: string } | null = null;

  export let data: {
    features: {
      commentsEnabled: boolean;
      reviewsEnabled: boolean;
      translationsEnabled: boolean;
      aiChatEnabled: boolean;
      likesEnabled: boolean;
      maintenanceMode: boolean;
      maintenanceMessage: string;
    };
    navMenu: { text: string; url: string }[];
    seeds: { id: string; label: string; endpoint: string }[];
  };

  let feat = { ...data.features };
  let saving = false;

  const FLAGS: {
    key: keyof typeof feat;
    label: string;
    what: string;
    scope: string;
    danger?: boolean;
  }[] = [
    {
      key: 'commentsEnabled',
      label: 'Comments',
      what: 'Allows visitors to submit text comments on articles. Comments pass through AI moderation before being saved. Disabling this hides the comment form and the existing comment list from all pages.',
      scope: 'All article pages · Travellers and anonymous visitors',
    },
    {
      key: 'reviewsEnabled',
      label: 'Star reviews',
      what: 'Allows authenticated travellers and business owners to leave 1–5 star ratings on destination, culture, food, and history pages. Disabling hides the review form but preserves existing reviews in Firestore.',
      scope: 'Content pages · Authenticated users only',
    },
    {
      key: 'translationsEnabled',
      label: 'Language selector',
      what: 'Shows the EN / KZ / RU language toggle in the site header. When a visitor selects a language, article text is translated on-demand via the active AI provider and cached server-side. Disabling removes the toggle immediately.',
      scope: 'Site header · All visitors',
    },
    {
      key: 'aiChatEnabled',
      label: 'AI travel chat',
      what: 'Shows the interactive Q&A assistant on history and destination pages. Visitors can ask questions about Kazakhstan in natural language. Disabling hides the chat widget across all content pages.',
      scope: 'History page · Destination pages · All visitors',
    },
    {
      key: 'likesEnabled',
      label: 'Article likes',
      what: 'Shows the heart/like button on articles. Clicks increment the articleLikes counter in Firestore directly from the client (no auth required, enforced by Firestore rules). Disabling hides the like button.',
      scope: 'All article pages · All visitors',
    },
    {
      key: 'maintenanceMode',
      label: 'Maintenance mode',
      what: 'When enabled, the public website shows a maintenance message instead of normal content. Admin routes remain accessible. Use this during major deployments or when fixing a critical production bug.',
      scope: 'Public site · All visitors',
      danger: true,
    },
  ];

  // Seed operations
  let seedState: Record<string, 'idle' | 'running' | 'done' | 'error'> = {};
  let seedMsg:   Record<string, string> = {};

  async function runSeed(endpoint: string, id: string) {
    if (!confirm(`Run "${id}" seed against the production Firestore database?`)) return;
    seedState[id] = 'running';
    try {
      const res  = await fetch(endpoint, { method: 'POST' });
      const json = await res.json().catch(() => ({}));
      seedState[id] = res.ok && json.success !== false ? 'done' : 'error';
      seedMsg[id]   = json.message ?? json.error ?? `HTTP ${res.status}`;
    } catch (e: any) {
      seedState[id] = 'error';
      seedMsg[id]   = e.message;
    }
  }
</script>

<div class="page">

  <!-- ── Header ─────────────────────────────────────────────────────── -->
  <div class="ph">
    <h1>System</h1>
    <p>Site-wide feature flags, data seeding operations, and navigation configuration — all without a code deployment.</p>
  </div>

  {#if form?.success}
    <div class="alert alert-ok">✓ Feature flags saved. Changes are live on the next page request.</div>
  {/if}
  {#if form?.error}
    <div class="alert alert-err">✗ {form.error}</div>
  {/if}

  <!-- ── Feature flags ──────────────────────────────────────────────── -->
  <form
    method="POST"
    action="?/saveFeatures"
    use:enhance={() => {
      saving = true;
      return async ({ update }) => { await update(); saving = false; };
    }}
  >
    <section class="card">
      <div class="card-head">
        <div>
          <h2>Feature Flags</h2>
          <p class="card-sub">Stored in Firestore at <code>siteConfig/features</code>. Changes propagate on the next server-side render — no redeployment needed. Use these as instant kill-switches during incidents.</p>
        </div>
      </div>

      <div class="flags">
        {#each FLAGS as f}
          <div class="flag-row" class:flag-danger={f.danger && feat[f.key]}>
            <div class="flag-body">
              <div class="flag-top">
                <span class="flag-label" class:label-danger={f.danger}>{f.label}</span>
                {#if f.danger}<span class="danger-tag">⚠ Affects all visitors</span>{/if}
              </div>
              <div class="flag-what">{f.what}</div>
              <div class="flag-scope"><span class="scope-label">Scope:</span> {f.scope}</div>
            </div>
            <label class="switch">
              <input type="checkbox" bind:checked={feat[f.key]} name={f.key} value="true" />
              <span class="slider" class:slider-red={f.danger}></span>
            </label>
            {#if !feat[f.key]}<input type="hidden" name={f.key} value="false" />{/if}
          </div>
        {/each}
      </div>

      {#if feat.maintenanceMode}
        <div class="maintenance-section">
          <label class="field-label" for="msg">Maintenance message shown to visitors</label>
          <textarea
            id="msg"
            name="maintenanceMessage"
            class="textarea"
            rows="2"
            maxlength="300"
            bind:value={feat.maintenanceMessage}
            placeholder="We're performing scheduled maintenance. Back shortly."
          ></textarea>
        </div>
      {/if}
    </section>

    <div class="save-row">
      <button type="submit" class="btn-save" disabled={saving}>
        {saving ? 'Saving…' : 'Save feature flags'}
      </button>
      <span class="save-note">Live on next request · No deployment needed</span>
    </div>
  </form>

  <!-- ── Navigation menu ────────────────────────────────────────────── -->
  <section class="card">
    <div class="card-head">
      <div>
        <h2>Navigation Menu</h2>
        <p class="card-sub">Current header menu links loaded from Firestore (<code>siteConfig/layout</code>). If no Firestore config exists, the fallback from <code>src/lib/config/local-site-config.json</code> is used. Edit directly in Firestore or update the JSON file.</p>
      </div>
    </div>
    {#if data.navMenu.length === 0}
      <p class="empty-inline">No Firestore nav config found — using local JSON fallback. The public site is using the menu from <code>local-site-config.json</code>.</p>
    {:else}
      <div class="nav-list">
        {#each data.navMenu as item, i}
          <div class="nav-item">
            <span class="nav-order">{i + 1}</span>
            <span class="nav-text">{item.text}</span>
            <span class="nav-url">{item.url}</span>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- ── Data seeds ─────────────────────────────────────────────────── -->
  <section class="card">
    <div class="card-head">
      <div>
        <h2>Data Operations</h2>
        <p class="card-sub">Run Firestore seeding and migration scripts from this panel instead of invoking API endpoints manually. Each operation writes directly to your <strong>production</strong> Firestore database via Admin SDK. All operations require admin session authentication.</p>
      </div>
    </div>

    <div class="seed-warning">
      ⚠ These operations write to production Firestore. They are designed to be safe to re-run (using <code>set … merge: true</code>), but always verify the data after running.
    </div>

    <div class="seeds">
      {#each data.seeds as s}
        <div class="seed-row">
          <div class="seed-info">
            <span class="seed-label">{s.label}</span>
            <span class="seed-endpoint">{s.endpoint}</span>
            {#if seedState[s.id] === 'done'}
              <span class="seed-ok">✓ {seedMsg[s.id] || 'Completed successfully'}</span>
            {:else if seedState[s.id] === 'error'}
              <span class="seed-err">✗ {seedMsg[s.id]}</span>
            {/if}
          </div>
          <button
            type="button"
            class="btn-seed"
            class:btn-running={seedState[s.id] === 'running'}
            class:btn-done={seedState[s.id] === 'done'}
            disabled={seedState[s.id] === 'running'}
            onclick={() => runSeed(s.endpoint, s.id)}
          >
            {#if seedState[s.id] === 'running'}Running…
            {:else if seedState[s.id] === 'done'}Done ✓
            {:else}Run
            {/if}
          </button>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .page { padding: 1.75rem 2rem; max-width: 860px; color: #0f172a; }

  .ph { margin-bottom: 1.25rem; }
  .ph h1 { font-size: 1.35rem; font-weight: 700; margin: 0 0 0.25rem; }
  .ph p  { font-size: 0.82rem; color: #64748b; margin: 0; }

  .alert { padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.8rem; margin-bottom: 1rem; }
  .alert-ok  { background: #f0fdf4; border: 1px solid #86efac; color: #15803d; }
  .alert-err { background: #fef2f2; border: 1px solid #fca5a5; color: #dc2626; }

  .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.5rem; margin-bottom: 1rem; }
  .card-head { margin-bottom: 1.25rem; }
  .card-head h2 { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #0f172a; margin: 0 0 0.35rem; }
  .card-sub { font-size: 0.76rem; color: #64748b; line-height: 1.55; margin: 0; }
  .card-sub code { font-size: 0.7rem; }

  /* Feature flags */
  .flags { display: flex; flex-direction: column; }
  .flag-row {
    display: flex; align-items: flex-start; gap: 1.25rem;
    padding: 1rem 0; border-bottom: 1px solid #f1f5f9;
    transition: background 0.1s;
  }
  .flag-row:last-child { border-bottom: none; padding-bottom: 0; }
  .flag-danger { background: #fff8f8; margin: 0 -1.5rem; padding: 1rem 1.5rem; border-radius: 0; }

  .flag-body  { flex: 1; }
  .flag-top   { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.3rem; }
  .flag-label { font-size: 0.875rem; font-weight: 700; color: #0f172a; }
  .label-danger { color: #dc2626; }
  .danger-tag { font-size: 0.65rem; color: #dc2626; background: #fee2e2; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 600; }
  .flag-what  { font-size: 0.77rem; color: #475569; line-height: 1.55; margin-bottom: 0.3rem; }
  .flag-scope { font-size: 0.71rem; color: #94a3b8; }
  .scope-label { font-weight: 600; }

  /* Switch */
  .switch { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; margin-top: 0.1rem; }
  .switch input { opacity: 0; width: 0; height: 0; }
  .slider {
    position: absolute; inset: 0; background: #e2e8f0;
    border-radius: 22px; cursor: pointer; transition: background 0.2s;
  }
  .slider::before {
    content: ''; position: absolute;
    width: 16px; height: 16px; left: 3px; bottom: 3px;
    background: #fff; border-radius: 50%; transition: transform 0.2s;
    box-shadow: 0 1px 3px #0002;
  }
  .switch input:checked + .slider { background: #22c55e; }
  .switch input:checked + .slider.slider-red { background: #dc2626; }
  .switch input:checked + .slider::before { transform: translateX(18px); }

  .maintenance-section { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
  .field-label { display: block; font-size: 0.78rem; font-weight: 600; color: #374151; margin-bottom: 0.4rem; }
  .textarea {
    width: 100%; box-sizing: border-box;
    padding: 0.6rem 0.75rem; font-size: 0.82rem; color: #374151;
    border: 1px solid #e2e8f0; border-radius: 7px; resize: vertical;
    outline: none; font-family: inherit;
  }
  .textarea:focus { border-color: #94a3b8; }

  .save-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
  .btn-save {
    padding: 0.6rem 1.5rem; background: #0f172a; color: #fff;
    border: none; border-radius: 7px; font-size: 0.85rem; font-weight: 600;
    cursor: pointer; transition: background 0.12s;
  }
  .btn-save:hover:not(:disabled) { background: #1e293b; }
  .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
  .save-note { font-size: 0.72rem; color: #94a3b8; }

  /* Nav list */
  .nav-list { display: flex; flex-direction: column; gap: 0.4rem; }
  .nav-item {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.55rem 0.85rem; background: #f8fafc;
    border: 1px solid #f1f5f9; border-radius: 7px;
  }
  .nav-order { font-size: 0.68rem; color: #94a3b8; font-weight: 600; width: 1.2rem; }
  .nav-text  { font-size: 0.82rem; font-weight: 600; color: #374151; }
  .nav-url   { font-size: 0.75rem; color: #94a3b8; font-family: monospace; margin-left: auto; }
  .empty-inline { font-size: 0.78rem; color: #94a3b8; font-style: italic; }
  .empty-inline code { font-size: 0.72rem; }

  /* Seeds */
  .seed-warning {
    padding: 0.65rem 0.9rem; background: #fff7ed;
    border: 1px solid #fed7aa; border-radius: 7px;
    font-size: 0.75rem; color: #9a3412; margin-bottom: 1rem; line-height: 1.5;
  }
  .seed-warning code { font-size: 0.7rem; }

  .seeds { display: flex; flex-direction: column; gap: 0.5rem; }
  .seed-row {
    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    padding: 0.85rem 1rem; background: #f8fafc;
    border: 1px solid #e2e8f0; border-radius: 8px;
  }
  .seed-info { display: flex; flex-direction: column; gap: 0.15rem; }
  .seed-label    { font-size: 0.83rem; font-weight: 600; color: #0f172a; }
  .seed-endpoint { font-size: 0.7rem; color: #94a3b8; font-family: monospace; }
  .seed-ok  { font-size: 0.72rem; color: #16a34a; font-weight: 500; }
  .seed-err { font-size: 0.72rem; color: #dc2626; }

  .btn-seed {
    padding: 0.38rem 0.9rem; font-size: 0.78rem; font-weight: 600;
    background: #fff; color: #0f172a;
    border: 1px solid #e2e8f0; border-radius: 6px;
    cursor: pointer; white-space: nowrap; flex-shrink: 0;
    transition: background 0.1s, border-color 0.1s;
  }
  .btn-seed:hover:not(:disabled) { background: #f1f5f9; border-color: #cbd5e1; }
  .btn-seed.btn-running { opacity: 0.6; cursor: not-allowed; }
  .btn-seed.btn-done    { border-color: #86efac; color: #15803d; background: #f0fdf4; }
</style>
