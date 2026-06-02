<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';

	let loading = true;
	let messages: any[] = [];
	let selectedMessage: any = null;
	let replyText = '';
	let sending = false;

	onMount(() => {
		if (!auth) { goto('/get-started'); return; }

		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (!firebaseUser) { goto('/get-started'); return; }
			await loadMessages(firebaseUser.uid);
			loading = false;
		});
		return () => unsubscribe();
	});

	async function loadMessages(uid: string) {
		try {
			const q = query(
				collection(db!, 'messages'),
				where('businessId', '==', uid),
				orderBy('createdAt', 'desc')
			);
			const snap = await getDocs(q);
			messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
		} catch (err) { console.error('Error:', err); }
	}

	async function sendReply() {
		if (!replyText.trim() || !selectedMessage) return;
		sending = true;
		try {
			await addDoc(collection(db!, 'messages'), {
				...selectedMessage,
				businessId: selectedMessage.businessId,
				fromBusiness: true,
				text: replyText,
				createdAt: serverTimestamp()
			});
			replyText = '';
			selectedMessage = null;
			await loadMessages(auth!.currentUser!.uid);
		} catch (err) { console.error(err); }
		sending = false;
	}

	function formatDate(date: any): string {
		if (!date) return '';
		const d = date.toDate ? date.toDate() : new Date(date);
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	}
</script>

<svelte:head>
	<title>Inbox — VERYNICE.kz</title>
</svelte:head>

<div class="inbox-page">
	<header class="page-header"><h1>Inbox</h1><p>Messages from customers</p></header>

	{#if loading}
		<div class="loading"><div class="spinner"></div></div>
	{:else if messages.length === 0}
		<div class="empty-state">
			<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
			</svg>
			<h2>No messages yet</h2>
			<p>Customer messages will appear here</p>
		</div>
	{:else}
		<div class="messages-container">
			<div class="messages-list">
				{#each messages as msg}
					<button class="message-item" class:selected={selectedMessage?.id === msg.id} on:click={() => selectedMessage = msg}>
						<div class="msg-header">
							<span class="sender">{msg.senderName || 'Guest'}</span>
							<span class="date">{formatDate(msg.createdAt)}</span>
						</div>
						<p class="preview">{msg.text?.substring(0, 60)}...</p>
					</button>
				{/each}
			</div>
			<div class="message-detail">
				{#if selectedMessage}
					<div class="detail-header">
						<h3>{selectedMessage.senderName || 'Guest'}</h3>
						<span>{selectedMessage.senderEmail || ''}</span>
					</div>
					<div class="detail-content"><p>{selectedMessage.text}</p></div>
					<div class="reply-box">
						<textarea bind:value={replyText} placeholder="Write a reply..." rows="3"></textarea>
						<button class="btn-send" on:click={sendReply} disabled={sending || !replyText.trim()}>
							{sending ? 'Sending...' : 'Send Reply'}
						</button>
					</div>
				{:else}
					<div class="no-selection">Select a message to view</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.inbox-page { max-width: 1000px; }
	.page-header { margin-bottom: 1.5rem; }
	.page-header h1 { font-size: 1.75rem; color: #0a1e3c; margin-bottom: 0.5rem; }
	.page-header p { color: #666; }
	.loading { display: flex; justify-content: center; padding: 4rem; }
	.spinner { width: 40px; height: 40px; border: 3px solid #f0f0f0; border-top-color: #0a1e3c; border-radius: 50%; animation: spin 0.8s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }
	.empty-state { text-align: center; padding: 4rem 2rem; background: white; border-radius: 12px; color: #6b7280; }
	.empty-state svg { color: #d1d5db; margin-bottom: 1rem; }
	.empty-state h2 { color: #374151; margin-bottom: 0.5rem; }
	.messages-container { display: grid; grid-template-columns: 300px 1fr; gap: 1rem; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); height: 500px; }
	.messages-list { border-right: 1px solid #e5e7eb; overflow-y: auto; }
	.message-item { width: 100%; padding: 1rem; border: none; background: none; text-align: left; cursor: pointer; border-bottom: 1px solid #e5e7eb; }
	.message-item:hover { background: #f9fafb; }
	.message-item.selected { background: #fffbf0; }
	.msg-header { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
	.sender { font-weight: 600; color: #0a1e3c; }
	.date { font-size: 0.75rem; color: #9ca3af; }
	.preview { font-size: 0.85rem; color: #6b7280; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.message-detail { padding: 1.5rem; display: flex; flex-direction: column; }
	.detail-header { margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
	.detail-header h3 { margin: 0 0 0.25rem; color: #0a1e3c; }
	.detail-header span { font-size: 0.85rem; color: #6b7280; }
	.detail-content { flex: 1; }
	.detail-content p { color: #374151; line-height: 1.6; }
	.reply-box { margin-top: 1rem; }
	.reply-box textarea { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; resize: none; margin-bottom: 0.5rem; }
	.btn-send { padding: 0.5rem 1rem; background: #E8A44A; color: white; border: none; border-radius: 6px; cursor: pointer; }
	.btn-send:disabled { opacity: 0.5; }
	.no-selection { display: flex; align-items: center; justify-content: center; height: 100%; color: #9ca3af; }
	@media (max-width: 640px) { .messages-container { grid-template-columns: 1fr; } .messages-list { height: 200px; } }
</style>
