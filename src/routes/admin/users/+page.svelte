<script lang="ts">
  import { enhance } from '$app/forms';

  export let data: {
    users: { uid: string; email: string; displayName: string; role: string; suspended: boolean; createdAt: string | null }[];
  };

  let filterText = '';
  let filterRole: 'all' | 'traveller' | 'business' | 'admin' = 'all';

  $: filtered = data.users.filter(u => {
    const q = filterText.toLowerCase();
    return (
      (!q || u.email.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q)) &&
      (filterRole === 'all' || u.role === filterRole)
    );
  });

  $: byRole = {
    traveller: data.users.filter(u => u.role === 'traveller').length,
    business:  data.users.filter(u => u.role === 'business').length,
    admin:     data.users.filter(u => u.role === 'admin').length,
    suspended: data.users.filter(u => u.suspended).length,
  };

  const ROLE_BADGE: Record<string, string> = {
    admin:     'role-admin',
    business:  'role-business',
    traveller: 'role-traveller',
  };

  const ROLE_DESCRIPTIONS: Record<string, string> = {
    traveller: 'Can browse, comment, and submit reviews. Cannot create listings.',
    business:  'Can manage listings, respond to bookings, and access analytics for their own business.',
    admin:     'Full access to all admin sections including user management, AI settings, and system configuration.',
  };

  function fmt(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
</script>

<div class="page">

  <!-- ── Header ─────────────────────────────────────────────────────── -->
  <div class="ph">
    <h1>Users</h1>
    <p>Manage registered accounts, assign roles, and suspend users who violate platform rules.</p>
  </div>

  <!-- ── Role summary ───────────────────────────────────────────────── -->
  <div class="role-summary">
    <button class="role-chip" class:chip-active={filterRole === 'all'} onclick={() => filterRole = 'all'}>
      <span class="chip-num">{data.users.length}</span>
      <span class="chip-label">All users</span>
    </button>
    <button class="role-chip" class:chip-active={filterRole === 'traveller'} onclick={() => filterRole = 'traveller'}>
      <span class="chip-dot role-traveller-dot"></span>
      <span class="chip-num">{byRole.traveller}</span>
      <span class="chip-label">Travellers</span>
    </button>
    <button class="role-chip" class:chip-active={filterRole === 'business'} onclick={() => filterRole = 'business'}>
      <span class="chip-dot role-business-dot"></span>
      <span class="chip-num">{byRole.business}</span>
      <span class="chip-label">Business</span>
    </button>
    <button class="role-chip" class:chip-active={filterRole === 'admin'} onclick={() => filterRole = 'admin'}>
      <span class="chip-dot role-admin-dot"></span>
      <span class="chip-num">{byRole.admin}</span>
      <span class="chip-label">Admins</span>
    </button>
    {#if byRole.suspended > 0}
      <div class="chip-suspended">
        <span>⚠</span> {byRole.suspended} suspended
      </div>
    {/if}
  </div>

  <!-- ── Role reference ─────────────────────────────────────────────── -->
  <div class="role-ref">
    {#each Object.entries(ROLE_DESCRIPTIONS) as [role, desc]}
      <div class="role-ref-card">
        <span class="badge {ROLE_BADGE[role]}">{role}</span>
        <span class="role-ref-desc">{desc}</span>
      </div>
    {/each}
  </div>

  <!-- ── Filter bar ─────────────────────────────────────────────────── -->
  <div class="toolbar">
    <input class="search" type="search" bind:value={filterText} placeholder="Search by name or email…" />
    <span class="result-count">{filtered.length} of {data.users.length} users shown</span>
  </div>

  <!-- ── Table or empty ─────────────────────────────────────────────── -->
  {#if data.users.length === 0}
    <div class="empty-state">
      <div class="empty-icon">▣</div>
      <h3>No users registered yet</h3>
      <p>When visitors create accounts via the Get Started flow they appear here. User documents are stored at <code>users/&#123;uid&#125;</code> in Firestore with their role, email, and display name.</p>
      <p class="empty-note">In dev mode with <code>SKIP_AUTH_IN_DEV=true</code>, the synthetic user <code>dev-user-uid</code> has no Firestore document, so this list appears empty.</p>
    </div>
  {:else if filtered.length === 0}
    <div class="empty-state small">
      <p>No users match your current filter. Try clearing the search or changing the role filter.</p>
    </div>
  {:else}
    <div class="table-wrap">
      <div class="table-head users-grid">
        <span>User</span>
        <span>Role</span>
        <span>Status</span>
        <span>Joined</span>
        <span>Change role</span>
        <span>Suspend</span>
      </div>
      {#each filtered as u (u.uid)}
        <div class="table-row users-grid" class:row-suspended={u.suspended}>
          <div class="cell-user">
            <div class="user-name">{u.displayName || '—'}</div>
            <div class="user-email">{u.email || u.uid}</div>
          </div>
          <span><span class="badge {ROLE_BADGE[u.role] ?? ''}">{u.role}</span></span>
          <span>
            {#if u.suspended}
              <span class="badge badge-suspended">Suspended</span>
            {:else}
              <span class="active-label">● Active</span>
            {/if}
          </span>
          <span class="cell-date">{fmt(u.createdAt)}</span>
          <form method="POST" action="?/updateRole" use:enhance class="inline-form">
            <input type="hidden" name="uid" value={u.uid} />
            <select name="role" class="role-select"
              onchange={(e) => e.currentTarget.form?.requestSubmit()}>
              <option value="traveller" selected={u.role === 'traveller'}>Traveller</option>
              <option value="business"  selected={u.role === 'business'}>Business</option>
              <option value="admin"     selected={u.role === 'admin'}>Admin</option>
            </select>
          </form>
          <form method="POST" action="?/toggleSuspend" use:enhance class="inline-form">
            <input type="hidden" name="uid" value={u.uid} />
            <input type="hidden" name="suspended" value={String(u.suspended)} />
            <button type="submit" class="btn-suspend" class:btn-unsuspend={u.suspended}>
              {u.suspended ? 'Unsuspend' : 'Suspend'}
            </button>
          </form>
        </div>
      {/each}
    </div>

    <p class="table-note">Showing newest 200 accounts. Role changes take effect immediately. Suspension blocks login but does not delete the account or its content.</p>
  {/if}
</div>

<style>
  .page { padding: 1.75rem 2rem; max-width: 1100px; color: #0f172a; }

  .ph { margin-bottom: 1.25rem; }
  .ph h1 { font-size: 1.35rem; font-weight: 700; margin: 0 0 0.25rem; }
  .ph p  { font-size: 0.82rem; color: #64748b; margin: 0; }

  /* Role summary chips */
  .role-summary { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; align-items: center; }
  .role-chip {
    display: flex; align-items: center; gap: 0.4rem;
    padding: 0.4rem 0.85rem; background: #fff;
    border: 1px solid #e2e8f0; border-radius: 7px;
    cursor: pointer; font-size: 0.78rem; color: #374151;
    transition: border-color 0.12s, background 0.12s;
  }
  .role-chip:hover { background: #f8fafc; }
  .role-chip.chip-active { background: #0f172a; color: #f1f5f9; border-color: #0f172a; }
  .chip-num { font-weight: 700; }
  .chip-label { color: inherit; }
  .chip-dot { width: 7px; height: 7px; border-radius: 50%; }
  .role-traveller-dot { background: #22c55e; }
  .role-business-dot  { background: #3b82f6; }
  .role-admin-dot     { background: #ef4444; }
  .chip-suspended { font-size: 0.75rem; color: #b45309; background: #fef3c7; padding: 0.4rem 0.85rem; border-radius: 7px; border: 1px solid #fcd34d; }

  /* Role reference */
  .role-ref { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px,1fr)); gap: 0.5rem; margin-bottom: 1.25rem; }
  .role-ref-card {
    display: flex; align-items: flex-start; gap: 0.6rem;
    background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
    padding: 0.75rem 0.9rem;
  }
  .role-ref-desc { font-size: 0.73rem; color: #64748b; line-height: 1.5; }

  /* Toolbar */
  .toolbar { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
  .search {
    flex: 1; max-width: 300px; padding: 0.45rem 0.75rem;
    font-size: 0.8rem; border: 1px solid #e2e8f0; border-radius: 7px;
    background: #fff; outline: none; color: #0f172a;
  }
  .search:focus { border-color: #94a3b8; }
  .result-count { font-size: 0.72rem; color: #94a3b8; margin-left: auto; }

  /* Table */
  .table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
  .table-head {
    display: grid; gap: 0.5rem; padding: 0.55rem 1rem;
    background: #f8fafc; border-bottom: 1px solid #e2e8f0;
    font-size: 0.67rem; font-weight: 700; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.07em;
  }
  .users-grid { grid-template-columns: 1fr 90px 100px 95px 120px 95px; }
  .table-row {
    display: grid; gap: 0.5rem;
    padding: 0.65rem 1rem; border-bottom: 1px solid #f1f5f9;
    align-items: center; font-size: 0.8rem;
  }
  .table-row:last-child { border-bottom: none; }
  .table-row:hover { background: #fafafa; }
  .table-row.row-suspended { opacity: 0.6; background: #fffbeb; }

  .cell-user { overflow: hidden; }
  .user-name  { font-weight: 600; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .user-email { font-size: 0.72rem; color: #94a3b8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cell-date  { font-size: 0.73rem; color: #64748b; }
  .active-label { font-size: 0.73rem; color: #16a34a; font-weight: 500; }

  .badge { display: inline-block; font-size: 0.67rem; padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 600; white-space: nowrap; }
  .role-admin     { background: #fee2e2; color: #dc2626; }
  .role-business  { background: #dbeafe; color: #1d4ed8; }
  .role-traveller { background: #dcfce7; color: #15803d; }
  .badge-suspended { background: #fef3c7; color: #b45309; }

  .inline-form { display: flex; margin: 0; }
  .role-select {
    width: 100%; padding: 0.3rem 0.45rem;
    font-size: 0.77rem; border: 1px solid #e2e8f0; border-radius: 5px;
    background: #fff; color: #374151; cursor: pointer; outline: none;
  }
  .btn-suspend {
    padding: 0.3rem 0.6rem; font-size: 0.73rem; font-weight: 500;
    border: 1px solid #e2e8f0; border-radius: 5px;
    background: #fff; color: #374151; cursor: pointer; white-space: nowrap;
  }
  .btn-suspend:hover { background: #fef2f2; color: #dc2626; border-color: #fca5a5; }
  .btn-unsuspend { border-color: #fcd34d; color: #92400e; background: #fffbeb; }
  .btn-unsuspend:hover { background: #fef3c7; }

  .table-note { font-size: 0.7rem; color: #94a3b8; margin-top: 0.6rem; }

  .empty-state {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
    padding: 3rem 2rem; text-align: center;
  }
  .empty-state.small { padding: 1.5rem 2rem; }
  .empty-icon { font-size: 2rem; color: #e2e8f0; display: block; margin-bottom: 0.75rem; }
  .empty-state h3 { font-size: 1rem; font-weight: 700; color: #374151; margin: 0 0 0.5rem; }
  .empty-state p  { font-size: 0.8rem; color: #64748b; max-width: 460px; margin: 0 auto 0.5rem; line-height: 1.55; }
  .empty-note { font-size: 0.72rem !important; color: #94a3b8 !important; font-style: italic; }
  .empty-note code { font-size: 0.7rem; }
</style>
