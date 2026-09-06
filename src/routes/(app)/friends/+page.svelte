<script lang="ts">
	import { UserPlus, Users, MapPin, Flame, Check, X, Trash2, Eye, EyeOff } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import {
		useFriends,
		useRequestFriend,
		useAnswerFriend,
		useSetSharing,
		useRemoveFriend
	} from '$api/friends/queries';
	import { apiErrorCode, apiErrorMessage } from '$api/errors';
	import { auth } from '$hooks/use-auth.svelte';
	import { t, i18n } from '$lib/i18n/index.svelte';
	import { formatDate, cn } from '$lib/utils';
	import AppHeader from '$lib/components/ui/AppHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	const friendsQuery = useFriends(() => auth.isAuthenticated);
	const request = useRequestFriend();
	const answer = useAnswerFriend();
	const setSharing = useSetSharing();
	const removeFriend = useRemoveFriend();

	let name = $state('');

	const friends = $derived(friendsQuery.data ?? []);
	const incoming = $derived(friends.filter((f) => f.awaitingYourAnswer));
	const outgoing = $derived(friends.filter((f) => f.status === 'PENDING' && !f.awaitingYourAnswer));
	const accepted = $derived(friends.filter((f) => f.status === 'ACCEPTED'));

	function messageFor(error: unknown): string {
		switch (apiErrorCode(error)) {
			case 'NOT_FOUND':
				return apiErrorMessage(error) ?? t().error.notFound;
			case 'CONFLICT':
			case 'BAD_REQUEST':
				return apiErrorMessage(error) ?? t().error.generic;
			default:
				return t().error.generic;
		}
	}

	async function onRequest(event: SubmitEvent) {
		event.preventDefault();
		try {
			await request.mutateAsync(name.trim());
			name = '';
			toast.success(t().friends.requestSent);
		} catch (error) {
			toast.error(messageFor(error));
		}
	}

	async function onAnswer(id: number, accept: boolean) {
		try {
			await answer.mutateAsync({ id, accept });
		} catch (error) {
			toast.error(messageFor(error));
		}
	}

	async function onToggleSharing(id: number, share: boolean) {
		try {
			await setSharing.mutateAsync({ id, share });
		} catch (error) {
			toast.error(messageFor(error));
		}
	}

	async function onRemove(id: number) {
		if (!confirm(t().friends.removeConfirm)) return;
		try {
			await removeFriend.mutateAsync(id);
		} catch (error) {
			toast.error(messageFor(error));
		}
	}
</script>

<svelte:head><title>{t().friends.title} · WanderTag</title></svelte:head>

<div class="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col">
	<AppHeader title={t().friends.title} />

	{#if !auth.isAuthenticated}
		<EmptyState title={t().auth.loginPrompt}>
			{#snippet icon()}<Users class="size-10" />{/snippet}
			{#snippet action()}
				<Button onclick={() => auth.login('/friends')}>{t().auth.login}</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="min-h-0 flex-1 overflow-y-auto">
			<form class="border-border flex flex-col gap-2 border-b p-4" onsubmit={onRequest}>
				<label class="flex flex-col gap-1">
					<span class="text-sm font-medium">{t().friends.addLabel}</span>
					<div class="flex gap-2">
						<input
							bind:value={name}
							required
							placeholder={t().friends.addPlaceholder}
							class="border-border-strong bg-surface focus:border-primary min-h-11 flex-1 rounded-lg border px-3 text-base focus:outline-none"
						/>
						<Button type="submit" loading={request.isPending} disabled={!name.trim()}>
							<UserPlus class="size-4" />
							{t().friends.add}
						</Button>
					</div>
				</label>
				<!-- Stated up front, not buried in a settings screen: sharing your position
				     is the one thing here with real privacy weight. -->
				<p class="text-muted-foreground text-xs leading-relaxed">{t().friends.privacy}</p>
			</form>

			{#if friendsQuery.isPending}
				<div class="grid place-items-center py-16"><Spinner class="text-muted-foreground" /></div>
			{:else if friends.length === 0}
				<EmptyState title={t().friends.empty}>
					{#snippet icon()}<Users class="size-10" />{/snippet}
				</EmptyState>
			{:else}
				{#if incoming.length}
					<section>
						<h2 class="text-muted-foreground px-4 pt-4 pb-1 text-xs font-semibold uppercase">
							{t().friends.pendingIncoming}
						</h2>
						<ul class="divide-border divide-y">
							{#each incoming as f (f.friendshipId)}
								<li class="flex items-center gap-3 px-4 py-3">
									<div class="min-w-0 flex-1">
										<p class="truncate font-medium">{f.displayName}</p>
										<p class="text-muted-foreground text-xs">
											{formatDate(f.createdAt, i18n.locale)}
										</p>
									</div>
									<Button size="sm" onclick={() => onAnswer(f.friendshipId, true)}>
										<Check class="size-4" />
										{t().friends.accept}
									</Button>
									<Button size="sm" variant="ghost" onclick={() => onAnswer(f.friendshipId, false)}>
										<X class="size-4" />
									</Button>
								</li>
							{/each}
						</ul>
					</section>
				{/if}

				{#if outgoing.length}
					<section>
						<h2 class="text-muted-foreground px-4 pt-4 pb-1 text-xs font-semibold uppercase">
							{t().friends.pendingOutgoing}
						</h2>
						<ul class="divide-border divide-y">
							{#each outgoing as f (f.friendshipId)}
								<li class="flex items-center gap-3 px-4 py-3">
									<p class="text-muted-foreground min-w-0 flex-1 truncate">{f.displayName}</p>
									<Button size="sm" variant="ghost" onclick={() => onRemove(f.friendshipId)}>
										<Trash2 class="size-4" />
									</Button>
								</li>
							{/each}
						</ul>
					</section>
				{/if}

				{#if accepted.length}
					<section>
						<h2 class="text-muted-foreground px-4 pt-4 pb-1 text-xs font-semibold uppercase">
							{t().friends.accepted}
						</h2>
						<ul class="divide-border divide-y">
							{#each accepted as f (f.friendshipId)}
								<li class="flex flex-col gap-2 px-4 py-3">
									<div class="flex items-center gap-3">
										<div
											class="bg-primary-subtle text-primary grid size-9 shrink-0 place-items-center rounded-full font-bold"
										>
											{f.displayName.charAt(0).toUpperCase()}
										</div>
										<div class="min-w-0 flex-1">
											<p class="truncate font-medium">{f.displayName}</p>
											<p class="text-muted-foreground flex items-center gap-2 pt-0.5 text-xs">
												<span class="inline-flex items-center gap-1">
													<MapPin class="size-3" />{t().friends.stats(f.discoveryCount)}
												</span>
												{#if f.currentStreak > 0}
													<span class="inline-flex items-center gap-1">
														<Flame class="size-3" />{f.currentStreak}
													</span>
												{/if}
											</p>
										</div>
										<Button size="sm" variant="ghost" onclick={() => onRemove(f.friendshipId)}>
											<Trash2 class="size-4" />
										</Button>
									</div>

									<div class="flex flex-wrap items-center gap-2 pl-12">
										<!-- Your own switch, for this one person. -->
										<button
											class={cn(
												'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
												f.youShare
													? 'bg-primary-subtle text-primary'
													: 'bg-surface-sunken text-muted-foreground'
											)}
											onclick={() => onToggleSharing(f.friendshipId, !f.youShare)}
											aria-pressed={f.youShare}
										>
											{#if f.youShare}<Eye class="size-3.5" />{:else}<EyeOff
													class="size-3.5"
												/>{/if}
											{f.youShare ? t().friends.sharingOn : t().friends.sharingOff}
										</button>

										<Badge tone={f.theyShare ? 'success' : 'neutral'}>
											{f.theyShare ? t().friends.theyShare : t().friends.theyDontShare}
										</Badge>
									</div>
								</li>
							{/each}
						</ul>
					</section>
				{/if}
			{/if}
		</div>
	{/if}
</div>
