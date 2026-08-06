<script lang="ts">
	import type { SpaRouter } from '../src/router.svelte'
	import { RouteBlocker } from '@ginjou/core'
	import { onDestroy } from 'svelte'
	import { probe } from './probe'

	// Mirrors what `useRouteBlocker` + `useWarnUnsaved` do, so the decision travels the same way
	// it does in an app: the controller publishes `blocked`, an effect picks that up, asks the user,
	// and only then settles the held navigation. The reset therefore arrives from inside a Svelte
	// flush, and the page reads its location through `onChangeLocation` the way `useLocation` and
	// `useEdit` do.
	const { router }: { router: SpaRouter } = $props()

	probe.mounts++

	let state = $state<RouteBlocker.StateValues>(RouteBlocker.State.Unblocked)

	// svelte-ignore state_referenced_locally
	const controller = router.blocker!({ should: () => true, enabled: true })

	const unsubscribe = controller.subscribe((value) => {
		state = value
	})

	// svelte-ignore state_referenced_locally
	const stopWatchLocation = router.onChangeLocation((location) => {
		probe.locations.push(location.path)
	})

	onDestroy(() => {
		unsubscribe()
		controller.dispose()
		stopWatchLocation?.()
	})

	// `$effect.pre`, not `$effect`: that is what `@ginjou/svelte`'s `watch()` defaults to.
	$effect.pre(() => {
		if (state !== RouteBlocker.State.Blocked)
			return

		void (async () => {
			probe.confirms++
			const confirmed = await Promise.resolve(probe.confirmResult)
			if (confirmed == null)
				return

			if (confirmed)
				controller.proceed()
			else
				controller.reset()
		})()
	})
</script>

<div data-testid="blocked-page">blocked page</div>
