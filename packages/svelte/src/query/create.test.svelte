<script lang="ts">
	import type { CreateOneFn } from '@ginjou/core'
	import { QueryClient } from '@tanstack/svelte-query'
	import { useCreateOne } from './create.svelte'

	let { createOne }: { createOne: CreateOneFn<{ id: number, title: string }, { title: string }> } = $props()

	const mutation = useCreateOne(
		{ resource: 'posts' },
		{
			fetchers: {
				default: {
					createOne: (...args) => createOne(...args),
				},
			},
			queryClient: new QueryClient(),
		},
	)
</script>

<button onclick={() => mutation.mutate({ params: { title: 'A' } })}>
	Create
</button>

{#if mutation.data}
	<p>{mutation.data.data.title}</p>
{/if}
