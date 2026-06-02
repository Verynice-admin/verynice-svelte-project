<script lang="ts">
  import { enhance } from '$app/forms';

  export let data: {
    comments: { id: string; path: string; postId: string; text: string; author: string; createdAt: string | null; isAiCorrected: boolean }[];
    reviews:  { id: string; path: string; postId: string; uid: string; author: string; title: string; body: string; rating: number; createdAt: string | null }[];
  };

  let tab: 'comments' | 'reviews' = 'comments';
  let filter = '';

  $: filteredComments = data.comments.filter(c => {
    const q = filter.toLowerCase();
    return !q || c.text.toLowerCase().includes(q) || c.author.toLowerCase().includes(q) || c.postId.toLowerCase().includes(q);
  });

  $: filteredReviews = data.reviews.filter(r => {
    const q = filter.toLowerCase();
    return !q || r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q) || r.postId.toLowerCase().includes(q);
  });

  function ago(iso: string | null): string {
    if (!iso) return '—';
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  }

  const stars = (n: number) => '★'.repeat(Math.max(0,n)) + '☆'.repeat(Math.max(0,5-n));
</script>

<div class="page">

  <!-- ── Header ─────────────────────────────────────────────────────── -->
  <div class="ph">
    <h1>Community</h1>
    <p>Moderate user-generated content — comments and star reviews — across all pages of VeryNice.kz.</p>
  </div>

  <!-- ── How it works ───────────────────────────────────────────────── -->
  <div class="info-row">
    <div class="info-card">
      <span class="info-icon">🤖</span>
      <div>
        <div class="info-title">AI pre-moderation</div>
        <div class="info-body">Every comment passes through the AI moderation pipeline before it is saved. The AI corrects grammar, replaces profanity with asterisks, and blocks severe hate speech automatically. Comments that fail processing are held and proceed with original text.</div>
      </div>
    </div>
    <div class="info-card">
      <span class="info-icon">⚡</span>
      <div>
        <div class="info-title">Rate limits</div>
        <div class="info-body">Visitors can submit 10 comments per minute per IP. Reviews are limited to 5 per minute. Each user may leave only one review per page. These limits are enforced server-side and cannot be bypassed from the browser.</div>
      </div>
    </div>
    <div class="info-card">
      <span class="info-icon">🛡️</span>
      <div>
        <div class="info-title">Your role here</div>
        <div class="info-body">You are the human override. If a comment slipped through moderation that should not be visible, delete it here. Deletions are permanent and immediate — there is no trash bin. The AI-edited badge shows comments the AI rewrote.</div>
      </div>
    </div>
  </div>

  <!-- ── Tabs + filter ──────────────────────────────────────────────── -->
  <div class="toolbar">
    <div class="tabs" role="tablist">
      <button role="tab" aria-selected={tab === 'comments'} class="tab" class:active={tab === 'comments'}
        onclick={() => { tab = 'comments'; filter = ''; }}>
        Comments
        <span class="tab-count">{data.comments.length}</span>
      </button>
      <button role="tab" aria-selected={tab === 'reviews'} class="tab" class:active={tab === 'reviews'}
        onclick={() => { tab = 'reviews'; filter = ''; }}>
        Reviews
        <span class="tab-count">{data.reviews.length}</span>
      </button>
    </div>
    <input class="search" type="search" bind:value={filter} placeholder="Filter by author, text, or page ID…" />
    <span class="result-count">{tab === 'comments' ? filteredComments.length : filteredReviews.length} shown</span>
  </div>

  <!-- ── Comments ───────────────────────────────────────────────────── -->
  {#if tab === 'comments'}
    {#if data.comments.length === 0}
      <div class="empty-state">
        <div class="empty-icon">◎</div>
        <h3>No comments yet</h3>
        <p>When visitors submit comments on articles, the 50 most recent will appear here. Each comment goes through AI moderation first — grammar is corrected and offensive content is blocked before it reaches Firestore.</p>
        <p class="empty-note">In production, new comments appear here in real time. In dev mode, Firestore collection-group queries require a service account with Admin SDK access.</p>
      </div>
    {:else if filteredComments.length === 0}
      <div class="empty-state small">
        <p>No comments match "<strong>{filter}</strong>". Try a different search term.</p>
      </div>
    {:else}
      <div class="table-wrap">
        <div class="table-head comments-grid">
          <span>Author</span>
          <span>Comment text</span>
          <span>Page</span>
          <span>When</span>
          <span>Flags</span>
          <span>Action</span>
        </div>
        {#each filteredComments as c (c.id)}
          <div class="table-row comments-grid">
            <span class="cell-author">{c.author}</span>
            <span class="cell-text" title={c.text}>{c.text.slice(0,100)}{c.text.length > 100 ? '…' : ''}</span>
            <span class="cell-page"><code>{c.postId}</code></span>
            <span class="cell-time">{ago(c.createdAt)}</span>
            <span class="cell-flags">
              {#if c.isAiCorrected}<span class="badge badge-ai">AI edited</span>{/if}
            </span>
            <span class="cell-action">
              <form method="POST" action="?/deleteComment" use:enhance>
                <input type="hidden" name="path" value={c.path} />
                <button class="btn-del" type="submit"
                  onclick={(e) => { if (!confirm('Permanently delete this comment?')) e.preventDefault(); }}>
                  Delete
                </button>
              </form>
            </span>
          </div>
        {/each}
      </div>
    {/if}
  {/if}

  <!-- ── Reviews ────────────────────────────────────────────────────── -->
  {#if tab === 'reviews'}
    {#if data.reviews.length === 0}
      <div class="empty-state">
        <div class="empty-icon">★</div>
        <h3>No reviews yet</h3>
        <p>Authenticated travellers and business owners can leave star ratings on destination, culture, food & drinks, and history pages. Each user is limited to one review per page and must be signed in.</p>
        <p class="empty-note">Reviews require a valid session cookie (role: traveller or business). They are stored at <code>pages/&#123;pageId&#125;/reviews/&#123;uid&#125;-&#123;timestamp&#125;</code> in Firestore.</p>
      </div>
    {:else if filteredReviews.length === 0}
      <div class="empty-state small">
        <p>No reviews match "<strong>{filter}</strong>".</p>
      </div>
    {:else}
      <div class="table-wrap">
        <div class="table-head reviews-grid">
          <span>Author</span>
          <span>Rating</span>
          <span>Title</span>
          <span>Page</span>
          <span>When</span>
          <span>Action</span>
        </div>
        {#each filteredReviews as r (r.id)}
          <div class="table-row reviews-grid">
            <span class="cell-author">{r.author}</span>
            <span class="cell-stars">{stars(r.rating)}</span>
            <span class="cell-text" title={r.body}>{r.title}</span>
            <span class="cell-page"><code>{r.postId}</code></span>
            <span class="cell-time">{ago(r.createdAt)}</span>
            <span class="cell-action">
              <form method="POST" action="?/deleteReview" use:enhance>
                <input type="hidden" name="path" value={r.path} />
                <button class="btn-del" type="submit"
                  onclick={(e) => { if (!confirm('Permanently delete this review?')) e.preventDefault(); }}>
                  Delete
                </button>
              </form>
            </span>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .page { padding: 1.75rem 2rem; max-width: 1200px; color: #0f172a; }

  .ph { margin-bottom: 1.25rem; }
  .ph h1 { font-size: 1.35rem; font-weight: 700; margin: 0 0 0.25rem; }
  .ph p  { font-size: 0.82rem; color: #64748b; margin: 0; }

  /* Info row */
  .info-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 0.75rem; margin-bottom: 1.5rem; }
  .info-card {
    display: flex; gap: 0.75rem;
    background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
    padding: 1rem 1.1rem;
  }
  .info-icon { font-size: 1.2rem; flex-shrink: 0; margin-top: 0.1rem; }
  .info-title { font-size: 0.8rem; font-weight: 700; color: #0f172a; margin-bottom: 0.3rem; }
  .info-body  { font-size: 0.75rem; color: #64748b; line-height: 1.55; }

  /* Toolbar */
  .toolbar { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
  .tabs { display: flex; background: #f1f5f9; border-radius: 7px; padding: 3px; gap: 2px; }
  .tab {
    display: flex; align-items: center; gap: 0.4rem;
    padding: 0.35rem 0.85rem;
    border: none; border-radius: 5px; cursor: pointer;
    font-size: 0.8rem; font-weight: 500;
    background: transparent; color: #64748b;
    transition: background 0.12s, color 0.12s;
  }
  .tab.active { background: #fff; color: #0f172a; box-shadow: 0 1px 3px #0001; }
  .tab-count {
    font-size: 0.68rem; background: #e2e8f0; color: #64748b;
    padding: 0.05rem 0.4rem; border-radius: 10px; font-weight: 600;
  }
  .tab.active .tab-count { background: #f1f5f9; }

  .search {
    flex: 1; max-width: 320px; padding: 0.45rem 0.75rem;
    font-size: 0.8rem; border: 1px solid #e2e8f0; border-radius: 7px;
    background: #fff; outline: none; color: #0f172a;
  }
  .search:focus { border-color: #94a3b8; }
  .result-count { font-size: 0.72rem; color: #94a3b8; margin-left: auto; }

  /* Tables */
  .table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }

  .table-head {
    display: grid; gap: 0.5rem;
    padding: 0.55rem 1rem;
    background: #f8fafc; border-bottom: 1px solid #e2e8f0;
    font-size: 0.67rem; font-weight: 700; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.07em;
  }

  .table-row {
    display: grid; gap: 0.5rem;
    padding: 0.7rem 1rem;
    border-bottom: 1px solid #f1f5f9;
    align-items: center; font-size: 0.8rem;
  }
  .table-row:last-child { border-bottom: none; }
  .table-row:hover { background: #fafafa; }

  .comments-grid { grid-template-columns: 110px 1fr 130px 70px 80px 70px; }
  .reviews-grid  { grid-template-columns: 110px 80px 1fr 130px 70px 70px; }

  .cell-author { font-weight: 600; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cell-text   { color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cell-page code { font-size: 0.7rem; color: #64748b; }
  .cell-time   { font-size: 0.72rem; color: #94a3b8; }
  .cell-stars  { color: #f59e0b; font-size: 0.75rem; letter-spacing: -1px; }
  .cell-flags  { display: flex; gap: 0.3rem; flex-wrap: wrap; }
  .cell-action form { margin: 0; }

  .badge { font-size: 0.62rem; padding: 0.12rem 0.4rem; border-radius: 4px; font-weight: 600; }
  .badge-ai { background: #ede9fe; color: #7c3aed; }

  .btn-del {
    padding: 0.28rem 0.65rem; font-size: 0.73rem; font-weight: 500;
    background: #fff; color: #dc2626;
    border: 1px solid #fca5a5; border-radius: 5px; cursor: pointer;
    white-space: nowrap;
  }
  .btn-del:hover { background: #fef2f2; }

  /* Empty states */
  .empty-state {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
    padding: 3rem 2rem; text-align: center;
  }
  .empty-state.small { padding: 1.5rem 2rem; }
  .empty-icon { font-size: 2rem; color: #e2e8f0; display: block; margin-bottom: 0.75rem; }
  .empty-state h3 { font-size: 1rem; font-weight: 700; color: #374151; margin: 0 0 0.5rem; }
  .empty-state p  { font-size: 0.8rem; color: #64748b; max-width: 480px; margin: 0 auto 0.5rem; line-height: 1.55; }
  .empty-note { font-size: 0.72rem !important; color: #94a3b8 !important; font-style: italic; }
  .empty-note code { font-size: 0.7rem; }
</style>
