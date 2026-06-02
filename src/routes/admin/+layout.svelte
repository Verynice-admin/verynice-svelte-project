<script lang="ts">
  import { page } from '$app/stores';
  export let data: { uid: string; role: string };

  const nav = [
    { href: '/admin',               label: 'Dashboard',  icon: '◈', desc: 'Overview & metrics' },
    { href: '/admin/content-audit', label: 'Content',    icon: '✦', desc: 'Editorial rewriting' },
    { href: '/admin/community',     label: 'Community',  icon: '◎', desc: 'Comments & reviews' },
    { href: '/admin/users',         label: 'Users',      icon: '▣', desc: 'Accounts & roles' },
    { href: '/admin/ai',            label: 'AI',         icon: '◇', desc: 'Providers & toggles' },
    { href: '/admin/system',        label: 'System',     icon: '⚙', desc: 'Flags & operations' },
    { href: '/admin/audit',         label: 'Audit Log',  icon: '◑', desc: 'Access history' },
  ];

  function isActive(href: string): boolean {
    const path = $page.url.pathname;
    if (href === '/admin') return path === '/admin';
    return path.startsWith(href);
  }

  $: activeLabel = nav.find(n => isActive(n.href))?.label ?? 'Admin';
</script>

<div class="admin-shell">
  <aside class="sidebar">
    <div class="brand">
      <span class="brand-dot"></span>
      <div class="brand-info">
        <span class="brand-name">VN Admin</span>
        <span class="brand-role">Super Admin</span>
      </div>
    </div>

    <nav aria-label="Admin navigation">
      {#each nav as item}
        <a
          href={item.href}
          class="nav-link"
          class:active={isActive(item.href)}
          title={item.desc}
          aria-current={isActive(item.href) ? 'page' : undefined}
        >
          <span class="nav-icon" aria-hidden="true">{item.icon}</span>
          <span class="nav-label">{item.label}</span>
        </a>
      {/each}
    </nav>

    <div class="sidebar-footer">
      <a href="/" class="back-link">← Public site</a>
    </div>
  </aside>

  <div class="workspace-wrap">
    <header class="topbar">
      <span class="topbar-section">{activeLabel}</span>
      <span class="topbar-env">localhost · dev</span>
    </header>
    <main class="workspace">
      <slot />
    </main>
  </div>
</div>

<style>
  /* ── Reset & isolation ──────────────────────────────────────────────────── */
  .admin-shell {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    color-scheme: light;           /* prevents browser dark-mode bleed */
    background: #f1f5f9;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  /* ── Sidebar ──────────────────────────────────────────────────────────── */
  .sidebar {
    width: 216px;
    flex-shrink: 0;
    background: #0c0f17;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #1a1f2e;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 1.1rem 1.1rem 1rem;
    border-bottom: 1px solid #1a1f2e;
  }

  .brand-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #d4a373;
    flex-shrink: 0;
    box-shadow: 0 0 6px #d4a37388;
  }

  .brand-info { display: flex; flex-direction: column; }

  .brand-name {
    font-size: 0.78rem;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    line-height: 1;
  }

  .brand-role {
    font-size: 0.65rem;
    color: #475569;
    margin-top: 0.2rem;
  }

  nav {
    flex: 1;
    padding: 0.6rem 0.6rem 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
    overflow-y: auto;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem 0.8rem;
    border-radius: 6px;
    text-decoration: none;
    color: #64748b;
    font-size: 0.82rem;
    font-weight: 500;
    transition: background 0.1s, color 0.1s;
    white-space: nowrap;
  }

  .nav-link:hover { background: #151b2a; color: #cbd5e1; }

  .nav-link.active {
    background: #1a2235;
    color: #d4a373;
    font-weight: 600;
  }

  .nav-icon {
    font-size: 0.78rem;
    width: 1rem;
    text-align: center;
    flex-shrink: 0;
  }

  .nav-label { flex: 1; }

  .sidebar-footer {
    padding: 0.85rem 1.1rem;
    border-top: 1px solid #1a1f2e;
  }

  .back-link {
    font-size: 0.72rem;
    color: #334155;
    text-decoration: none;
    transition: color 0.1s;
  }
  .back-link:hover { color: #64748b; }

  /* ── Right panel ─────────────────────────────────────────────────────── */
  .workspace-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #f1f5f9;
    min-width: 0;
  }

  .topbar {
    height: 44px;
    flex-shrink: 0;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
  }

  .topbar-section {
    font-size: 0.8rem;
    font-weight: 600;
    color: #0f172a;
    letter-spacing: 0.02em;
  }

  .topbar-env {
    font-size: 0.7rem;
    color: #94a3b8;
    font-family: monospace;
    background: #f1f5f9;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }

  .workspace {
    flex: 1;
    overflow-y: auto;
    color: #0f172a;
    background: #f1f5f9;
  }
</style>
