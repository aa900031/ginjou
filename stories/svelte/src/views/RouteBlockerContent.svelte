<script lang="ts">
	import { useGo, useRouteBlocker } from '@ginjou/svelte'
	import Button from '../components/Button.svelte'
	import Card from '../components/Card.svelte'
	import InlineActions from '../components/InlineActions.svelte'
	import LocaleBadge from '../components/LocaleBadge.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Stack from '../components/Stack.svelte'

	let enabled = $state(true)
	let shouldBlock = $state(true)

	const blocker = useRouteBlocker(() => ({ enabled, shouldBlock }))
	const go = useGo()
</script>

<Stack>
	<LocaleBadge />
	<PageTitle>Route Blocker</PageTitle>

	<Card>
		No confirm dialog here: a held navigation waits until Proceed or Reset is pressed, so every
		step of the state machine is visible. Turn <strong>shouldBlock</strong> off to let navigations
		through while the blocker stays registered, or turn <strong>enabled</strong> off to unregister
		it entirely.
	</Card>

	<Card>
		State: <strong data-testid="state">{blocker.state}</strong>
	</Card>

	<InlineActions>
		<Button type="button" onclick={() => enabled = !enabled}>
			enabled: {enabled}
		</Button>
		<Button type="button" onclick={() => shouldBlock = !shouldBlock}>
			shouldBlock: {shouldBlock}
		</Button>
	</InlineActions>

	<InlineActions>
		<Button type="button" disabled={blocker.state !== 'blocked'} onclick={() => blocker.proceed()}>
			Proceed
		</Button>
		<Button type="button" disabled={blocker.state !== 'blocked'} onclick={() => blocker.reset()}>
			Reset
		</Button>
	</InlineActions>

	<InlineActions>
		<Button type="button" onclick={() => go({ to: '/posts' })}>
			Go to list
		</Button>
		<Button type="button" onclick={() => go({ to: '/posts/1' })}>
			Go to show
		</Button>
		<Button type="button" onclick={() => go({ to: '/blocker', query: { page: '2' } })}>
			Change query only
		</Button>
	</InlineActions>
</Stack>
