<script lang="ts">
	import type { SpaRouter } from '../src/router.svelte'
	import { createRouter } from '../src/router.svelte'

	// `createRouter()` registers a `beforeunload` listener and tears it down `onDestroy`, so it
	// has to run inside a real component for the teardown to be the real one.
	const { onready }: { onready: (router: SpaRouter) => void } = $props()

	// svelte-ignore state_referenced_locally
	onready(createRouter())
</script>
