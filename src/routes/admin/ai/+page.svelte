<script lang="ts">
  import { enhance } from '$app/forms';

  export let form: { success?: boolean; error?: string } | null = null;

  export let data: {
    configured: { groq: boolean; gemini: boolean; openrouter: boolean; openai: boolean };
    aiConfig: {
      activeProvider: string;
      commentModerationEnabled: boolean;
      editorialRewriteEnabled: boolean;
      translationEnabled: boolean;
      aiChatEnabled: boolean;
    };
  };

  let cfg = { ...data.aiConfig };
  let saving = false;

  const providers = [
    {
      id: 'groq',
      label: 'Groq',
      models: 'Llama 3.3 70B · Mixtral 8x7B',
      speed: 'Fastest',
      cost: 'Free tier available',
      note: 'Best for real-time comment moderation and translation. Lowest latency of all providers. Recommended primary.',
      speedColor: '#22c55e',
    },
    {
      id: 'gemini',
      label: 'Google Gemini',
      models: 'Gemini 1.5 Flash · Pro',
      speed: 'Fast',
      cost: 'Free tier available',
      note: 'Strong multilingual performance — good for Kazakh and Russian content translation. Good fallback.',
      speedColor: '#3b82f6',
    },
    {
      id: 'openrouter',
      label: 'OpenRouter',
      models: 'Multiple (configurable)',
      speed: 'Variable',
      cost: 'Per-token pricing',
      note: 'Gateway to dozens of models including Claude, GPT-4o, and open-source alternatives. Use as a flexible fallback.',
      speedColor: '#8b5cf6',
    },
    {
      id: 'openai',
      label: 'OpenAI',
      models: 'GPT-4o · GPT-4o mini',
      speed: 'Medium',
      cost: 'Highest cost',
      note: 'Highest output quality but also highest cost. Reserve for critical editorial rewriting rather than high-volume tasks.',
      speedColor: '#f59e0b',
    },
  ];

  // Narrow to boolean-only keys so bind:checked receives boolean, not string | boolean.
  type BooleanAiKey = 'commentModerationEnabled' | 'editorialRewriteEnabled' | 'translationEnabled' | 'aiChatEnabled';

  const toggles: {
    key: BooleanAiKey;
    label: string;
    what: string;
    impact: string;
    disableWarning?: string;
  }[] = [
    {
      key: 'commentModerationEnabled',
      label: 'Comment AI moderation',
      what: 'Before a visitor comment is saved, it is sent to the active AI provider. The AI corrects grammar, replaces profanity, and blocks severe hate speech. Without this, raw comment text goes straight to Firestore.',
      impact: 'Affects every comment submission across the site.',
      disableWarning: 'Disabling this means all comments are saved without moderation. Only disable during an AI provider outage.',
    },
    {
      key: 'editorialRewriteEnabled',
      label: 'Editorial rewrite workflow',
      what: 'Enables the Content → Editorial Rewrite tool. When enabled, the content-audit page can send article sections to the AI for professional rewriting in the National Geographic Traveler voice.',
      impact: 'Only affects the admin content-audit tool — no public-facing impact.',
    },
    {
      key: 'translationEnabled',
      label: 'On-demand translation',
      what: 'Powers the language selector on the public site. When a visitor selects Kazakh or Russian, article text is sent to the AI for translation and cached server-side. Disabling this hides the language selector.',
      impact: 'Affects the language selector visible to all visitors.',
      disableWarning: 'Disabling removes the language toggle from the public site immediately.',
    },
    {
      key: 'aiChatEnabled',
      label: 'AI travel chat assistant',
      what: 'The interactive Q&A widget on history and destination pages. Visitors can ask questions about Kazakhstan and receive conversational answers from the active AI provider. Disabling hides the chat widget.',
      impact: 'Affects the chat button on all content pages.',
    },
  ];
</script>

<div class="page">

  <!-- ── Header ─────────────────────────────────────────────────────── -->
  <div class="ph">
    <h1>AI Management</h1>
    <p>Control which AI provider powers site features and toggle individual AI capabilities without a code deployment.</p>
  </div>

  {#if form?.success}
    <div class="alert alert-ok">✓ Configuration saved to Firestore. Changes are live immediately.</div>
  {/if}
  {#if form?.error}
    <div class="alert alert-err">✗ {form.error}</div>
  {/if}

  <form
    method="POST"
    action="?/saveConfig"
    use:enhance={() => {
      saving = true;
      return async ({ update }) => { await update(); saving = false; };
    }}
  >

    <!-- ── Providers ───────────────────────────────────────────────── -->
    <section class="card">
      <div class="card-head">
        <div>
          <h2>AI Provider</h2>
          <p class="card-sub">Select which AI service handles all AI-powered features. Only providers with API keys configured in environment variables are available. The active provider is used for comment moderation, translation, chat, and editorial rewriting simultaneously.</p>
        </div>
      </div>

      <div class="providers">
        {#each providers as p}
          {@const configured = data.configured[p.id as keyof typeof data.configured]}
          <label class="provider-card" class:provider-active={cfg.activeProvider === p.id} class:provider-disabled={!configured}>
            <div class="provider-top">
              <input
                type="radio"
                name="activeProvider"
                value={p.id}
                bind:group={cfg.activeProvider}
                disabled={!configured}
              />
              <span class="provider-status" class:status-on={configured} class:status-off={!configured}>
                {configured ? 'Configured' : 'No API key'}
              </span>
            </div>
            <div class="provider-name">{p.label}</div>
            <div class="provider-models">{p.models}</div>
            <div class="provider-tags">
              <span class="tag" style="color:{p.speedColor}">{p.speed}</span>
              <span class="tag tag-cost">{p.cost}</span>
            </div>
            <div class="provider-note">{p.note}</div>
          </label>
        {/each}
      </div>

      <p class="card-footer-note">To add a provider, set its API key environment variable and restart the server. Key names: <code>GROQ_API_KEY</code> · <code>GEMINI_API_KEY</code> · <code>OPENROUTER_API_KEY</code> · <code>OPENAI_API_KEY</code>.</p>
    </section>

    <!-- ── Feature toggles ────────────────────────────────────────── -->
    <section class="card">
      <div class="card-head">
        <div>
          <h2>Feature Toggles</h2>
          <p class="card-sub">Each toggle controls one AI-powered feature independently. Changes are stored in Firestore (<code>siteConfig/aiConfig</code>) and take effect on the next server request — no deployment needed. Use these as circuit breakers during provider outages.</p>
        </div>
      </div>

      <div class="toggles">
        {#each toggles as t}
          <div class="toggle-row">
            <div class="toggle-body">
              <div class="toggle-header">
                <span class="toggle-label">{t.label}</span>
                <label class="switch">
                  <input type="checkbox" bind:checked={cfg[t.key]} name={t.key} value="true" />
                  <span class="slider"></span>
                </label>
                {#if !cfg[t.key]}<input type="hidden" name={t.key} value="false" />{/if}
              </div>
              <div class="toggle-what">{t.what}</div>
              <div class="toggle-impact">
                <span class="impact-label">Impact:</span> {t.impact}
              </div>
              {#if t.disableWarning && !cfg[t.key]}
                <div class="toggle-warning">⚠ {t.disableWarning}</div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </section>

    <div class="save-row">
      <button type="submit" class="btn-save" disabled={saving}>
        {saving ? 'Saving…' : 'Save configuration'}
      </button>
      <span class="save-note">Changes persist in Firestore and take effect immediately without redeployment.</span>
    </div>
  </form>
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
  .card-footer-note { font-size: 0.72rem; color: #94a3b8; margin-top: 1rem; line-height: 1.5; }
  .card-footer-note code { font-size: 0.68rem; }

  /* Providers */
  .providers { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px,1fr)); gap: 0.6rem; }

  .provider-card {
    padding: 1rem; border: 1.5px solid #e2e8f0; border-radius: 9px;
    cursor: pointer; background: #fafafa;
    transition: border-color 0.12s, background 0.12s;
    display: flex; flex-direction: column; gap: 0.3rem;
  }
  .provider-card:hover:not(.provider-disabled) { background: #f8fafc; border-color: #cbd5e1; }
  .provider-active  { border-color: #d4a373 !important; background: #fffbf5 !important; }
  .provider-disabled { opacity: 0.45; cursor: not-allowed; }

  .provider-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem; }
  .provider-status { font-size: 0.65rem; font-weight: 600; padding: 0.1rem 0.4rem; border-radius: 4px; }
  .status-on  { background: #dcfce7; color: #15803d; }
  .status-off { background: #fee2e2; color: #dc2626; }

  .provider-name   { font-size: 0.85rem; font-weight: 700; color: #0f172a; }
  .provider-models { font-size: 0.7rem; color: #64748b; }
  .provider-tags   { display: flex; gap: 0.4rem; margin-top: 0.1rem; }
  .tag      { font-size: 0.65rem; font-weight: 600; }
  .tag-cost { color: #94a3b8; }
  .provider-note { font-size: 0.71rem; color: #64748b; line-height: 1.45; margin-top: 0.25rem; }

  /* Toggles */
  .toggles { display: flex; flex-direction: column; }

  .toggle-row { padding: 1.1rem 0; border-bottom: 1px solid #f1f5f9; }
  .toggle-row:last-child { border-bottom: none; padding-bottom: 0; }

  .toggle-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; }
  .toggle-label  { font-size: 0.875rem; font-weight: 700; color: #0f172a; }
  .toggle-what   { font-size: 0.78rem; color: #475569; line-height: 1.55; margin-bottom: 0.3rem; }
  .toggle-impact { font-size: 0.73rem; color: #64748b; }
  .impact-label  { font-weight: 600; }
  .toggle-warning {
    margin-top: 0.4rem; padding: 0.4rem 0.65rem;
    background: #fff7ed; border: 1px solid #fed7aa; border-radius: 6px;
    font-size: 0.72rem; color: #9a3412;
  }

  /* Switch */
  .switch { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; }
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
  .switch input:checked + .slider::before { transform: translateX(18px); }

  /* Save row */
  .save-row { display: flex; align-items: center; gap: 1rem; margin-top: 0.25rem; }
  .btn-save {
    padding: 0.6rem 1.5rem; background: #0f172a; color: #fff;
    border: none; border-radius: 7px; font-size: 0.85rem; font-weight: 600;
    cursor: pointer; transition: background 0.12s;
  }
  .btn-save:hover:not(:disabled) { background: #1e293b; }
  .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
  .save-note { font-size: 0.72rem; color: #94a3b8; }
</style>
