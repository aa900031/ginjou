<script lang="ts">
	import type { RouteDefinition } from 'svelte-spa-router'
	import type { SpaRouter } from '../src/router.svelte'
	import Router from 'svelte-spa-router'
	import { createRouter } from '../src/router.svelte'

	// The wiring a real app does: build the router, then hand `<Router>` the routes it guards.
	const {
		routes,
		onready,
		onconditionsfailed,
	}: {
		routes: RouteDefinition
		onready: (router: SpaRouter) => void
		onconditionsfailed?: () => void
	} = $props()

	const router = createRouter()

	// svelte-ignore state_referenced_locally
	onready(router)

	// svelte-ignore state_referenced_locally
	const blockableRoutes = router.withBlocker(routes)
</script>

<Router
	routes={blockableRoutes}
	onConditionsFailed={onconditionsfailed}
/>
