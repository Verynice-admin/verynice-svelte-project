<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { getFirestore, getFirebaseAuth, getFirebaseGoogleProvider } from '$lib/firebase';
  import {
    collection, getDocs, doc,
    updateDoc, getDoc, orderBy, query as fsQuery
  } from 'firebase/firestore';
  import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
  import type { User } from 'firebase/auth';

  // ── Auth state ─────────────────────────────────────────────────────────────
  let currentUser: User | null = null;
  let authLoading = true;

  // ── Types ──────────────────────────────────────────────────────────────────
  type ArticleType = 'destination' | 'travel-tips' | 'food-and-drinks' | 'heritage' | 'history';

  interface ArticleItem {
    id: string;
    path: string;
    attractionTitle: string;
    sectionTitle: string;
    articleType: ArticleType;
    contentMarkdown: string;
    wordCount: number;
    position: number;
    totalSections: number;
    hasBackup: boolean;
    rewrittenAt: string | null;
    rewriteProvider: string | null;
    needsFactCheck: boolean;
    isTip: boolean;
  }

  // ── State ──────────────────────────────────────────────────────────────────
  let articles: ArticleItem[] = [];
  let loading = true;
  let loadError = '';

  let selected: ArticleItem | null = null;
  let rewriteInput = '';
  let saving = false;
  let saveMsg = '';
  let copyMsg = '';

  let filterText = '';
  let filterType: ArticleType | 'all' = 'all';
  let filterStatus: 'all' | 'pending' | 'done' = 'all';
  let sortBy: 'title' | 'words' | 'status' = 'title';

  let isRewiring = false;
  let rewriteProgress = '';

  // ── Helpers ────────────────────────────────────────────────────────────────
  function wc(text: string): number {
    return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  }

  function inferType(parentType: string, sectionTitle: string, regionId: string): ArticleType {
    const t = (sectionTitle || '').toLowerCase();
    const r = (regionId || '').toLowerCase();
    if (/food|flavor|cuisine|dish|dastarkhan|tea|beshbarmak|noodle|drink/.test(t)) return 'food-and-drinks';
    if (/heritage|tradition|music|craft|dance|costume|eagle|dombra|yurt|kokpar/.test(t)) return 'heritage';
    if (/history|empire|khan|silk.road|ancient|coloniz|soviet|famine|independence/.test(t)) return 'history';
    if (/tip|visa|money|transport|logistics|safety|budget|getting.there|getting.around/.test(t)) return 'travel-tips';
    if (parentType === 'travel-tips' || r.includes('tips')) return 'travel-tips';
    return 'destination';
  }

  const TYPE_STYLES: Record<ArticleType, string> = {
    'destination':    'background:#dbeafe;color:#1d4ed8',
    'travel-tips':    'background:#f3e8ff;color:#7e22ce',
    'food-and-drinks':'background:#fef3c7;color:#b45309',
    'heritage':       'background:#dcfce7;color:#15803d',
    'history':        'background:#fee2e2;color:#b91c1c',
  };

  // ── Auth ───────────────────────────────────────────────────────────────────
  async function signIn() {
    const auth     = getFirebaseAuth();
    const provider = getFirebaseGoogleProvider();
    if (!auth || !provider) return;
    try { await signInWithPopup(auth, provider); }
    catch (e: any) { console.error('Sign-in failed', e); }
  }

  async function signOutUser() {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await signOut(auth);
  }

  // ── Load from Firestore ────────────────────────────────────────────────────
  onMount(async () => {
    if (!browser) return;

    const auth = getFirebaseAuth();
    if (auth) {
      onAuthStateChanged(auth, user => {
        currentUser = user;
        authLoading = false;
      });
    } else {
      authLoading = false;
    }

    try {
      const db = await getFirestore();
      if (!db) { loadError = 'Firebase not initialised'; loading = false; return; }

      const result: ArticleItem[] = [];

      // ── Destinations — parallel region + attraction reads ─────────────────
      const regionsSnap = await getDocs(collection(db, 'pages/destinationsPage/articles'));

      const attSnapsByRegion = await Promise.all(
        regionsSnap.docs.map(regionDoc =>
          getDocs(collection(db, `pages/destinationsPage/articles/${regionDoc.id}/attractions`))
            .then(snap => ({ regionId: regionDoc.id, snap }))
        )
      );

      const allAttractions = attSnapsByRegion.flatMap(({ regionId, snap }) =>
        snap.docs.map(attDoc => ({ regionId, attDoc }))
      );

      const articleResults = await Promise.all(
        allAttractions.map(({ regionId, attDoc }) => {
          const attData = attDoc.data() as Record<string, any>;
          return getDocs(fsQuery(collection(db, `${attDoc.ref.path}/articles`), orderBy('order', 'asc')))
            .then(artSnap => ({ regionId, attDoc, attData, artSnap }));
        })
      );

      for (const { regionId, attData, artSnap } of articleResults) {
        if (artSnap.empty) continue;
        const parentTitle = attData.mainTitle || attData.title || '';
        const parentType  = attData.type || 'destination';
        artSnap.docs.forEach((artDoc, idx) => {
          const d = artDoc.data() as Record<string, any>;
          if (!d.contentMarkdown) return;
          result.push({
            id:              artDoc.ref.path,
            path:            artDoc.ref.path,
            attractionTitle: parentTitle,
            sectionTitle:    d.title || `Section ${idx + 1}`,
            articleType:     inferType(parentType, d.title || '', regionId),
            contentMarkdown: d.contentMarkdown,
            wordCount:       wc(d.contentMarkdown),
            position:        idx + 1,
            totalSections:   artSnap.docs.length,
            hasBackup:       !!d.contentMarkdown_original,
            rewrittenAt:     d.editorialRewrite?.processedAt ?? null,
            rewriteProvider: d.editorialRewrite?.provider ?? null,
            needsFactCheck:  !!d.needsFactCheck,
            isTip:           false,
          });
        });
      }

      // ── Travel Tips ───────────────────────────────────────────────────────
      const tipsSnap = await getDocs(collection(db, 'pages/travelTipsPage/tips'));
      tipsSnap.docs.forEach(tipDoc => {
        const d = tipDoc.data() as Record<string, any>;
        const body = d.contentMarkdown || d.content || d.body || '';
        if (!body) return;
        result.push({
          id:              tipDoc.ref.path,
          path:            tipDoc.ref.path,
          attractionTitle: d.title || tipDoc.id,
          sectionTitle:    d.title || tipDoc.id,
          articleType:     'travel-tips',
          contentMarkdown: body,
          wordCount:       wc(body),
          position:        1,
          totalSections:   1,
          hasBackup:       !!d.contentMarkdown_original,
          rewrittenAt:     d.editorialRewrite?.processedAt ?? null,
          rewriteProvider: d.editorialRewrite?.provider ?? null,
          needsFactCheck:  !!d.needsFactCheck,
          isTip:           true,
        });
      });

      articles = result;
    } catch (e: any) {
      loadError = e.message || 'Failed to load';
    } finally {
      loading = false;
    }
  });

  // ── Filtered + sorted list ─────────────────────────────────────────────────
  $: filtered = articles
    .filter(a => {
      const q = filterText.toLowerCase();
      if (q && !a.attractionTitle.toLowerCase().includes(q) && !a.sectionTitle.toLowerCase().includes(q)) return false;
      if (filterType !== 'all' && a.articleType !== filterType) return false;
      if (filterStatus === 'pending' && a.rewrittenAt) return false;
      if (filterStatus === 'done'    && !a.rewrittenAt) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'words')  return b.wordCount - a.wordCount;
      if (sortBy === 'status') return (a.rewrittenAt ? 1 : 0) - (b.rewrittenAt ? 1 : 0);
      return a.attractionTitle.localeCompare(b.attractionTitle);
    });

  $: stats = {
    total:   articles.length,
    done:    articles.filter(a => a.rewrittenAt).length,
    pending: articles.filter(a => !a.rewrittenAt).length,
  };

  // ── Editorial prompt builder ───────────────────────────────────────────────
  function buildPrompt(article: ArticleItem): string {
    return `You are the senior editor of VERYNICE.KZ — a premium English-language travel publication
about Kazakhstan written for international readers discovering it for the first time.

Your writing voice is National Geographic Traveler at its finest:
— Authoritative but warm — the voice of a brilliant friend who has been everywhere
— Cinematic and specific — every scene could be photographed
— Curious and knowing — you find meaning in small details others walk past
— Emotionally honest — places change people, and you say so

Occasionally — perhaps once per article, never forced — you may slip in a gentle nod
to Borat's cultural footprint. Not mockery. Not the joke itself. Just a quiet,
self-aware wink that acknowledges Kazakhstan knows exactly what the world thinks,
and finds it mildly amusing. Example: "Yes, this is the real Kazakhstan.
No, the swimsuit is not standard issue." Then move on immediately. Never dwell on it.

Most importantly: write like a human being who was actually moved by this place.
Not an AI. Not a brochure. Not a Wikipedia article lightly paraphrased.
Write with the small imperfections, the personal asides, the moments of genuine
surprise that only a real traveler notices. Use contractions. Let sentences breathe.
Occasionally start a sentence with "And" or "But." Let one thought interrupt another
with a dash — like real thinking does.

HUMANIZATION RULES (non-negotiable):
— Vary sentence length dramatically. Short punches. Then a longer, more considered
  thought that winds through an observation before landing somewhere unexpected.
— Use "you" to address the reader directly — pull them into the scene
— Include one moment of genuine uncertainty or surprise: "I didn't expect..."
  or "Nobody warns you about..." or "What the guidebooks miss..."
— Avoid perfect parallel structure — real writers break their own patterns
— One light self-deprecating or observational aside per article is encouraged
— Never use: "In conclusion," "To summarize," "It is worth noting,"
  "It is important to mention," "Delve into," "Tapestry," "Vibrant,"
  "Nestled," "Bustling," "Hidden gem," "Off the beaten path," "Rich culture,"
  "Ancient traditions," "Breathtaking," "Must-see," "Step back in time,"
  "Truly unique," "Undiscovered," "World-class," "World-famous"

ARTICLE TYPE: ${article.articleType}
CURRENT WORD COUNT: ${article.wordCount} words

ARTICLE TEXT:
"""
${article.contentMarkdown}
"""

---

PHASE 1 — EDITORIAL AUDIT

Score each dimension 1–10. Be brutally specific. Vague praise is useless.

1. Opening Hook (1–10)
Does the first sentence create irresistible curiosity?
Fail if it starts with: "Kazakhstan is..." / "Welcome to..." / "Located in..." /
"Known for..." / "[Place name] is a..."

2. Decolonized Perspective (1–10) [history/heritage only, N/A otherwise]
Told from Kazakh civilizational perspective outward?
Kazakh Khanate 1465 → Silk Road → Dzungar Wars → Russian annexation (not integration)
→ Alash Orda → Asharshylyk (1.5–2.3M dead, 1930–33) → Independence as culmination.
Flag any Soviet-era framing as neutral development. Flag any omission of Asharshylyk.

3. Sensory Immersion (1–10)
Minimum 3 senses per descriptive paragraph. Sight alone = fail.
What does it smell like? Sound underneath the silence? Texture underfoot?

4. Human Anchor (1–10)
Specific person — name, face, voice, choice — carrying the reader?
"A local woman" = fail. "Aizat, who has sold kurt here since 1987" = pass.

5. Voice and Energy (1–10)
Human or encyclopedic? Does it read like someone who was actually there?
Count passive constructions. Count opinion-free sentences.

6. Kazakh Cultural Authenticity (1–10)
Kazakh words woven naturally — definition in the sentence, never in a glossary?
Could this paragraph describe any Central Asian country? If yes, rewrite.

7. Cliché and AI-Pattern Count
List every banned phrase found. Also flag: overly perfect parallel lists,
robotic transition phrases, suspiciously uniform sentence length.

8. Factual Depth (1–10)
Specific and verifiable, or thin and generic?
"Long nomadic history" = 2/10. "Kazakh Khanate, founded 1465 by Janibek and Kerei" = 9/10.

9. Human Voice Score (1–10)
Does it read like it was written by a curious, slightly imperfect human traveler?
Or does it read like AI output — too clean, too balanced, too complete?
Flag: uniform sentence rhythm, no contractions, no personal asides,
no moments of surprise or uncertainty.

---

PHASE 2 — REWRITTEN ARTICLE

Rewrite the full article following all rules above plus these laws:

LAW 1 — NATGEO OPENING: Begin with a specific scene, sensory moment, or
human detail that could only happen here. Never geography. Never welcome.
✓ "Nobody warns you about the silence. Not the quiet of an empty room —
   the active silence of ten thousand square kilometers holding its breath."
✗ "Kazakhstan is a vast country known for its steppe landscapes."

LAW 2 — THREE SENSES MINIMUM: Every destination or cultural moment must
engage at least three senses. Before any descriptive paragraph ask:
what does it smell like here? What is the sound underneath the silence?

LAW 3 — HUMAN FACE: One specific person anchors every article.
Not "a guide." Not "locals." A name, a detail, a moment of real humanity.

LAW 4 — DECOLONIZED HISTORY [history/heritage articles]:
History begins with the Kazakhs. Use these anchors where relevant:
Saka warriors (5th c. BCE) → Silk Road (Kazakhstan WAS it, not beside it) →
Kazakh Khanate 1465 (Janibek & Kerei Khans) → Dzungar Wars (existential fight) →
Russian annexation 1731–1848 (call it annexation, not joining) →
Kazakh resistance: Srym Datov, Kenesary Khan →
Alash Orda 1917–1920 (a functioning sovereign government) →
Asharshylyk 1930–33 (1.5–2.3M dead — Irish Famine scale — never minimize) →
Independence 1991 as culmination, not gift.

LAW 5 — KAZAKH LANGUAGE: 3–5 words woven naturally.
Meaning lives in the sentence. No glossary boxes ever.
✓ "The dombra — two strings, impossible resonance — sounds like grief
   and celebration occupying the same note."

LAW 6 — ZERO CLICHÉS: All banned phrases listed above are forbidden.
Replace each with one specific concrete detail.
✗ "warm hospitality"
✓ "You will be invited in before you finish knocking."

LAW 7 — ACTIVE VOICE: Subjects do things. Always.
✗ "The steppe is characterized by extreme temperatures."
✓ "The steppe freezes to -40°C in January. By July it bakes at 40°C.
   Same land. Six months apart."

LAW 8 — HUMAN IMPERFECTION: Write like a traveler, not a database.
— At least one contraction per paragraph
— One moment of surprise, uncertainty, or personal aside per article
— Sentence length must vary — short. Then longer and more winding.
— Occasionally start with And or But
— One gentle Borat-aware aside if it fits naturally — never forced

LAW 9 — FOOD IS CEREMONY [food articles]:
Social ritual first, ingredients last.
The sheep's head goes to the honored guest. The ear to a child.
The eye to someone who must see clearly. This is beshbarmak.
The noodles are just how it gets to the table.

LAW 10 — WORD COUNT IS A FLOOR: Minimum ${article.wordCount} words.
Enrichment expands. It never compresses.

LAW 11 — UNREPEATABLE OPENING: Read it aloud.
Could it describe Kyrgyzstan? Mongolia? Generic steppe?
If yes — rewrite until it could only be this place, this story.

LAW 12 — THE CLOSING CHORD: End with a final image or line that lands
quietly — not a summary, not "In conclusion." A feeling. An illumination.
The reader sits with it for a moment before scrolling on.

---

PHASE 3 — FACT VERIFICATION FLAGS

List 3–5 specific claims requiring verification:
- State the claim
- Flag if it may originate from Russian-framing sources
- Suggest a reliable non-CIS source to verify against

---

OUTPUT FORMAT — use exactly these headers, nothing else:

### AUDIT SCORECARD
[scores and specific diagnosis]

### REWRITTEN ARTICLE
[full rewrite — minimum ${article.wordCount} words]

### FACT VERIFICATION FLAGS
[3–5 items]

### EDITOR'S NOTE
[3 sentences: biggest problems in original, most important changes made]`;
  }

  // ── Auto-rewrite: copy prompt + open Claude ────────────────────────────────
  async function autoRewriteWithPuter(article: ArticleItem) {
    isRewiring = true;
    const prompt = buildPrompt(article);
    try {
      await navigator.clipboard.writeText(prompt);
      rewriteProgress = '✓ Prompt copied — paste into Claude';
    } catch {
      rewriteProgress = '⚠ Clipboard blocked — prompt in console';
      console.log('=== CLAUDE PROMPT ===\n', prompt);
    }
    window.open('https://claude.ai', '_blank');
    isRewiring = false;
  }

  // ── Clipboard + open Claude ────────────────────────────────────────────────
  async function sendToClaude(article: ArticleItem) {
    const prompt = buildPrompt(article);
    try {
      await navigator.clipboard.writeText(prompt);
      copyMsg = '✓ Prompt copied to clipboard!';
    } catch {
      copyMsg = '⚠ Clipboard blocked — see console for prompt';
      console.log('=== CLAUDE PROMPT ===\n', prompt);
    }
    window.open('https://claude.ai/new', '_blank');
    setTimeout(() => (copyMsg = ''), 4000);
  }

  // ── Save rewrite to Firestore ──────────────────────────────────────────────
  async function saveRewrite() {
    if (!selected || !rewriteInput.trim()) return;
    if (!currentUser) { saveMsg = '✗ Sign in first'; return; }
    saving = true;
    saveMsg = '';
    try {
      const db = await getFirestore();
      if (!db) throw new Error('Firebase not ready');

      const ref  = doc(db, selected.path);
      const snap = await getDoc(ref);
      const data = snap.data() as Record<string, any> | undefined;
      if (!data) throw new Error('Document not found');

      const update: Record<string, any> = {
        contentMarkdown: rewriteInput.trim(),
        needsFactCheck: true,
        editorialRewrite: {
          ...(data.editorialRewrite || {}),
          source:          'manual',
          processedAt:     new Date().toISOString(),
          wordCountBefore: selected.wordCount,
          wordCountAfter:  wc(rewriteInput.trim()),
        }
      };

      if (!data.contentMarkdown_original) {
        update.contentMarkdown_original = data.contentMarkdown || data.content || data.body || '';
      }

      await updateDoc(ref, update);

      const idx = articles.findIndex(a => a.id === selected!.id);
      if (idx > -1) {
        articles[idx] = {
          ...articles[idx],
          contentMarkdown: rewriteInput.trim(),
          wordCount: wc(rewriteInput.trim()),
          hasBackup: true,
          rewrittenAt: new Date().toISOString(),
          rewriteProvider: 'manual',
          needsFactCheck: true,
        };
        articles = [...articles];
        selected = articles[idx];
      }

      saveMsg = '✓ Saved to Firebase';
      setTimeout(() => (saveMsg = ''), 4000);
    } catch (e: any) {
      saveMsg = `✗ Error: ${e.message}`;
    } finally {
      saving = false;
    }
  }

  function selectArticle(article: ArticleItem) {
    selected = article;
    rewriteInput = '';
    saveMsg = '';
    copyMsg = '';
  }

  function fmtDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
</script>

<svelte:head>
  <title>Content Audit — VeryNice Admin</title>
</svelte:head>

<div class="audit-shell">

  <!-- ── Top bar ── -->
  <div class="audit-topbar">
    <span class="topbar-title">Content Audit</span>

    {#if loading}
      <span class="topbar-loading">Loading…</span>
    {:else if loadError}
      <span class="topbar-error">{loadError}</span>
    {:else}
      <span class="topbar-stat">{stats.total} sections</span>
      <span class="topbar-done">{stats.done} rewritten</span>
      <span class="topbar-pending">{stats.pending} pending</span>
      <div class="topbar-progress">
        <div class="topbar-progress-fill" style="width:{stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%"></div>
      </div>
      <span class="topbar-pct">{stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%</span>
    {/if}

    <div class="topbar-auth">
      {#if authLoading}
        <span class="auth-loading">…</span>
      {:else if currentUser}
        <span class="auth-user">✓ {currentUser.email}</span>
        <button class="btn-signout" on:click={signOutUser}>Sign out</button>
      {:else}
        <span class="auth-hint">Not signed in — reads work, saves need sign-in</span>
        <button class="btn-google" on:click={signIn}>
          <svg width="14" height="14" viewBox="0 0 24 24" style="flex-shrink:0">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
      {/if}
    </div>
  </div>

  <!-- ── Body ── -->
  <div class="audit-body">

    {#if loading}
      <div class="audit-loading">
        <div class="loading-text">Loading Firestore…</div>
        <div class="loading-sub">Reading 145 attractions × 8 sections each</div>
      </div>
    {:else if loadError}
      <div class="audit-loading">
        <div class="error-text">{loadError}</div>
      </div>
    {:else}

      <!-- ── Sidebar ── -->
      <aside class="audit-sidebar">
        <div class="sidebar-filters">
          <input class="filter-input" placeholder="Search articles…" bind:value={filterText} />
          <div class="filter-row">
            <select class="filter-select" bind:value={filterType}>
              <option value="all">All types</option>
              <option value="destination">Destination</option>
              <option value="travel-tips">Travel tips</option>
              <option value="food-and-drinks">Food &amp; drinks</option>
              <option value="heritage">Heritage</option>
              <option value="history">History</option>
            </select>
            <select class="filter-select" bind:value={filterStatus}>
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="done">Rewritten</option>
            </select>
          </div>
          <div class="sort-row">
            <span class="sort-label">Sort:</span>
            {#each (['title', 'words', 'status'] as const) as s}
              <button class="sort-btn" class:sort-btn--active={sortBy === s} on:click={() => (sortBy = s)}>{s}</button>
            {/each}
            <span class="sort-count">{filtered.length} shown</span>
          </div>
        </div>

        <div class="sidebar-list">
          {#each filtered as article (article.id)}
            <button
              class="article-row"
              class:article-row--active={selected?.id === article.id}
              on:click={() => selectArticle(article)}
            >
              <span class="row-dot" class:row-dot--done={!!article.rewrittenAt}>
                {article.rewrittenAt ? '●' : '○'}
              </span>
              <div class="row-text">
                <div class="row-title">{article.attractionTitle}</div>
                <div class="row-section">{article.sectionTitle}</div>
                <div class="row-meta">
                  <span class="type-badge" style={TYPE_STYLES[article.articleType]}>{article.articleType}</span>
                  <span class="row-words">{article.wordCount}w</span>
                  {#if article.rewrittenAt}
                    <span class="row-date">{fmtDate(article.rewrittenAt)}</span>
                  {/if}
                </div>
              </div>
            </button>
          {/each}

          {#if filtered.length === 0}
            <div class="list-empty">No articles match filters</div>
          {/if}
        </div>
      </aside>

      <!-- ── Main editor ── -->
      <main class="audit-main">
        {#if !selected}
          <div class="editor-placeholder">← Select an article to begin</div>
        {:else}
          <div class="editor-header">
            <div>
              <h1 class="editor-title">{selected.attractionTitle}</h1>
              <p class="editor-meta">
                {selected.sectionTitle}
                <span class="meta-dot">·</span>
                Section {selected.position}/{selected.totalSections}
                <span class="meta-dot">·</span>
                <span class="type-badge" style={TYPE_STYLES[selected.articleType]}>{selected.articleType}</span>
                <span class="meta-dot">·</span>
                {selected.wordCount} words
              </p>
              {#if selected.rewrittenAt}
                <p class="editor-status editor-status--done">
                  ✓ Rewritten {fmtDate(selected.rewrittenAt)}{#if selected.rewriteProvider} via {selected.rewriteProvider}{/if}
                </p>
              {:else}
                <p class="editor-status editor-status--pending">○ Not yet rewritten</p>
              {/if}
            </div>

            <div class="send-col">
              <div class="btn-group">
                <button class="btn-claude" on:click={() => sendToClaude(selected!)}>
                  Copy prompt &amp; open Claude
                </button>
                <button
                  class="btn-puter"
                  on:click={() => autoRewriteWithPuter(selected!)}
                  disabled={isRewiring}
                >
                  {isRewiring ? 'Copying…' : '⚡ Copy prompt &amp; open Claude.ai'}
                </button>
              </div>
              {#if copyMsg}
                <span class="copy-msg" class:copy-msg--ok={copyMsg.startsWith('✓')}>{copyMsg}</span>
              {/if}
              {#if rewriteProgress}
                <p class="rewrite-status" class:rewrite-status--err={rewriteProgress.startsWith('✗')}>
                  {rewriteProgress}
                </p>
              {/if}
            </div>
          </div>

          {#if selected.needsFactCheck}
            <div class="factcheck-banner">
              ⚠️ Contains AI-generated specific facts — verify before publishing: dates, prices, measurements, quoted speech.
            </div>
          {/if}

          <div class="section-block">
            <div class="section-label">
              Current content {selected.hasBackup ? '(original backed up ✓)' : '(no backup yet)'}
            </div>
            <div class="content-preview">{selected.contentMarkdown}</div>
          </div>

          <div class="instructions">
            1. Click <strong>Copy prompt &amp; open Claude</strong> above →
            2. Paste in Claude (⌘V / Ctrl+V) →
            3. Copy Claude's <strong>### REWRITTEN ARTICLE</strong> section →
            4. Paste below → Save
          </div>

          <div class="section-block">
            <div class="section-label">
              Paste rewritten content here
              {#if rewriteInput}<span class="word-count">{wc(rewriteInput)} words</span>{/if}
            </div>
            <textarea
              class="rewrite-textarea"
              placeholder="Paste Claude's rewritten article section here…"
              bind:value={rewriteInput}
            ></textarea>
          </div>

          <div class="save-row">
            {#if !currentUser}
              <button class="btn-google" on:click={signIn}>
                <svg width="16" height="16" viewBox="0 0 24 24" style="flex-shrink:0">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in to save
              </button>
              <span class="save-hint">Reads and Copy work without sign-in</span>
            {:else}
              <button class="btn-save" disabled={!rewriteInput.trim() || saving} on:click={saveRewrite}>
                {saving ? 'Saving…' : 'Save to Firebase'}
              </button>
              {#if rewriteInput.trim() && !saving}
                <span class="save-hint">
                  {selected.hasBackup ? 'Will update content only (backup already exists)' : 'Will backup original + save rewrite'}
                </span>
              {/if}
            {/if}

            {#if saveMsg}
              <span class="save-msg" class:save-msg--ok={saveMsg.startsWith('✓')}>{saveMsg}</span>
            {/if}
          </div>
        {/if}
      </main>

    {/if}
  </div>
</div>

<style>
  /* ── Shell ─────────────────────────────────────────────────────────────── */
  .audit-shell {
    position: fixed;
    inset: 0;
    top: 56px;
    z-index: 30;
    background: #030712;
    color: #f3f4f6;
    font-family: ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace;
    font-size: 0.875rem;
    display: flex;
    flex-direction: column;
  }

  /* ── Top bar ───────────────────────────────────────────────────────────── */
  .audit-topbar {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: nowrap;
    padding: 0.625rem 1.5rem;
    background: #111827;
    border-bottom: 1px solid #1f2937;
    min-height: 48px;
    overflow: hidden;
  }
  .topbar-title  { font-weight: 600; color: #fff; letter-spacing: -0.02em; white-space: nowrap; }
  .topbar-loading{ color: #9ca3af; white-space: nowrap; }
  .topbar-error  { color: #f87171; white-space: nowrap; }
  .topbar-stat   { color: #9ca3af; white-space: nowrap; }
  .topbar-done   { color: #34d399; white-space: nowrap; }
  .topbar-pending{ color: #fbbf24; white-space: nowrap; }
  .topbar-progress {
    flex: 0 0 100px;
    height: 6px;
    background: #374151;
    border-radius: 999px;
    overflow: hidden;
  }
  .topbar-progress-fill { height: 100%; background: #10b981; transition: width 0.5s ease; }
  .topbar-pct   { font-size: 0.75rem; color: #6b7280; white-space: nowrap; }

  .topbar-auth {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }
  .auth-loading { font-size: 0.75rem; color: #4b5563; }
  .auth-user    { font-size: 0.75rem; color: #34d399; white-space: nowrap; }
  .auth-hint    { font-size: 0.75rem; color: #fbbf24; white-space: nowrap; }

  /* ── Buttons ───────────────────────────────────────────────────────────── */
  .btn-signout {
    font-size: 0.75rem; color: #6b7280;
    border: 1px solid #374151; padding: 0.25rem 0.5rem; border-radius: 4px;
    background: transparent; cursor: pointer; white-space: nowrap;
  }
  .btn-signout:hover { color: #d1d5db; border-color: #4b5563; }

  .btn-google {
    display: inline-flex; align-items: center; gap: 6px;
    background: #fff; color: #111827; font-weight: 500;
    padding: 0.3rem 0.75rem; border-radius: 4px; cursor: pointer;
    border: none; font-size: 0.8125rem; white-space: nowrap;
    font-family: inherit;
  }
  .btn-google:hover { background: #f3f4f6; }

  .btn-claude {
    display: inline-flex; align-items: center; gap: 8px;
    background: #6d28d9; color: #fff; font-weight: 500;
    padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;
    border: none; font-size: 0.875rem; white-space: nowrap;
    font-family: inherit; transition: background 0.15s;
  }
  .btn-claude:hover { background: #5b21b6; }

  .btn-puter {
    display: inline-flex; align-items: center; gap: 6px;
    background: #0369a1; color: #fff; font-weight: 500;
    padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;
    border: none; font-size: 0.875rem; white-space: nowrap;
    font-family: inherit; transition: background 0.15s;
  }
  .btn-puter:hover:not(:disabled) { background: #0284c7; }
  .btn-puter:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-group { display: flex; flex-wrap: wrap; gap: 0.5rem; }

  .btn-save {
    background: #065f46; color: #fff; font-weight: 500;
    padding: 0.5rem 1.5rem; border-radius: 6px; cursor: pointer;
    border: none; font-size: 0.875rem; white-space: nowrap;
    font-family: inherit; transition: background 0.15s;
  }
  .btn-save:hover:not(:disabled) { background: #047857; }
  .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Body (sidebar + main) ─────────────────────────────────────────────── */
  .audit-body {
    flex: 1 1 0;
    display: flex;
    overflow: hidden;
    min-height: 0;
  }

  /* ── Loading / error ──────────────────────────────────────────────────── */
  .audit-loading {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 0.5rem;
  }
  .loading-text { color: #9ca3af; font-size: 1.125rem; animation: blink 2s infinite; }
  .loading-sub  { color: #4b5563; font-size: 0.75rem; }
  .error-text   { color: #f87171; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.5} }

  /* ── Sidebar ──────────────────────────────────────────────────────────── */
  .audit-sidebar {
    width: 320px;
    min-width: 320px;
    max-width: 320px;
    display: flex;
    flex-direction: column;
    background: #111827;
    border-right: 1px solid #1f2937;
    overflow: hidden;
  }

  .sidebar-filters {
    flex: 0 0 auto;
    padding: 0.75rem;
    border-bottom: 1px solid #1f2937;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .filter-input {
    width: 100%; box-sizing: border-box;
    background: #1f2937; border: 1px solid #374151; border-radius: 4px;
    padding: 0.375rem 0.75rem; font-size: 0.875rem; color: #fff;
    outline: none; font-family: inherit;
  }
  .filter-input:focus { border-color: #3b82f6; }
  .filter-input::placeholder { color: #6b7280; }

  .filter-row { display: flex; gap: 0.5rem; }
  .filter-select {
    flex: 1; min-width: 0;
    background: #1f2937; border: 1px solid #374151; border-radius: 4px;
    padding: 0.25rem 0.5rem; font-size: 0.75rem; color: #d1d5db;
    outline: none; font-family: inherit; cursor: pointer;
  }

  .sort-row {
    display: flex; align-items: center; gap: 0.25rem;
    font-size: 0.75rem; color: #6b7280;
  }
  .sort-label { margin-right: 0.25rem; }
  .sort-btn {
    background: none; border: none; color: #6b7280; cursor: pointer;
    padding: 0.125rem 0.5rem; border-radius: 3px; font-size: 0.75rem; font-family: inherit;
  }
  .sort-btn:hover { color: #d1d5db; }
  .sort-btn--active { background: #374151; color: #fff; }
  .sort-count { margin-left: auto; color: #4b5563; }

  /* ── Sidebar article list ─────────────────────────────────────────────── */
  .sidebar-list {
    flex: 1 1 0;
    overflow-y: auto;
    min-height: 0;
  }

  .article-row {
    display: flex;
    width: 100%; box-sizing: border-box;
    text-align: left;
    padding: 0.625rem 0.75rem;
    border: none;
    border-bottom: 1px solid #1f2937;
    border-left: 2px solid transparent;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    gap: 0.5rem;
    transition: background 0.1s;
  }
  .article-row:hover { background: #1f2937; }
  .article-row--active { background: #1f2937; border-left-color: #3b82f6; }

  .row-dot { font-size: 0.75rem; color: #4b5563; margin-top: 1px; flex-shrink: 0; }
  .row-dot--done { color: #34d399; }

  .row-text { min-width: 0; flex: 1; }
  .row-title   { font-size: 0.75rem; color: #e5e7eb; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row-section { font-size: 0.75rem; color: #6b7280; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row-meta    { display: flex; gap: 0.5rem; margin-top: 4px; align-items: center; flex-wrap: wrap; }
  .row-words   { font-size: 0.75rem; color: #4b5563; }
  .row-date    { font-size: 0.75rem; color: #4b5563; }
  .list-empty  { padding: 1.5rem; text-align: center; color: #4b5563; }

  .type-badge {
    display: inline-block;
    font-size: 0.6875rem;
    padding: 0.125rem 0.375rem;
    border-radius: 3px;
    white-space: nowrap;
  }

  /* ── Main editor ──────────────────────────────────────────────────────── */
  .audit-main {
    flex: 1 1 0;
    min-width: 0;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .editor-placeholder {
    flex: 1; display: flex;
    align-items: center; justify-content: center;
    color: #4b5563; font-size: 1rem;
  }

  .editor-header {
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 1rem; flex-wrap: wrap;
  }
  .editor-title  { font-size: 1.125rem; font-weight: 600; color: #fff; margin: 0; }
  .editor-meta   { color: #9ca3af; margin: 0.25rem 0 0; font-size: 0.875rem; }
  .meta-dot      { margin: 0 0.5rem; color: #374151; }
  .editor-status { font-size: 0.75rem; margin: 0.25rem 0 0; }
  .editor-status--done    { color: #34d399; }
  .editor-status--pending { color: #fbbf24; }

  .send-col { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
  .copy-msg          { font-size: 0.75rem; color: #6b7280; }
  .copy-msg--ok      { color: #34d399; }
  .rewrite-status    { font-size: 0.8125rem; margin: 4px 0 0; color: #16a34a; }
  .rewrite-status--err { color: #dc2626; }

  .section-block { display: flex; flex-direction: column; gap: 0.5rem; }
  .section-label {
    font-size: 0.6875rem; font-weight: 500; color: #6b7280;
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .word-count { margin-left: 0.5rem; color: #4b5563; }

  .content-preview {
    background: #111827; border: 1px solid #374151; border-radius: 6px;
    padding: 1rem; color: #d1d5db; font-size: 0.875rem; line-height: 1.6;
    white-space: pre-wrap; max-height: 16rem; overflow-y: auto;
  }

  .instructions {
    font-size: 0.75rem; color: #6b7280;
    border-top: 1px solid #1f2937; padding-top: 1rem;
  }
  .instructions strong { color: #d1d5db; }

  .rewrite-textarea {
    width: 100%; box-sizing: border-box;
    background: #111827; border: 1px solid #374151; border-radius: 6px;
    padding: 1rem; color: #e5e7eb; font-size: 0.875rem; line-height: 1.6;
    resize: vertical; min-height: 240px; outline: none;
    font-family: ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace;
  }
  .rewrite-textarea:focus { border-color: #3b82f6; }
  .rewrite-textarea::placeholder { color: #4b5563; }

  .save-row {
    display: flex; align-items: center; gap: 1rem;
    flex-wrap: wrap; padding-bottom: 2rem;
  }
  .save-hint   { font-size: 0.75rem; color: #4b5563; }
  .save-msg    { font-size: 0.875rem; font-weight: 500; color: #f87171; }
  .save-msg--ok{ color: #34d399; }

  .factcheck-banner {
    background: #fef9c3;
    color: #854d0e;
    border: 1px solid #fde047;
    border-radius: 6px;
    padding: 0.625rem 1rem;
    font-size: 0.8125rem;
    font-weight: 500;
  }
</style>
