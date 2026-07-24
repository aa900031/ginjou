<script lang="ts">
	import { useSelect } from '@ginjou/svelte'
	import type { Post } from '@ginjou/storybook-shared/mock-data'
	import Card from '../components/Card.svelte'
	import FieldLabel from '../components/FieldLabel.svelte'
	import Input from '../components/Input.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Select from '../components/Select.svelte'
	import Stack from '../components/Stack.svelte'

	let value = $state<string[] | undefined>()

	const select = useSelect<Post>(() => ({
		resource: 'posts',
		value,
	}))
</script>

<Stack>
	<PageTitle>useSelect</PageTitle>

	<FieldLabel>
		<span>Search</span>
		<Input
			placeholder="Keyword for option list"
			bind:value={
				() => select.search ?? '',
				(v) => select.search = v || undefined
			}
		/>
	</FieldLabel>

	<FieldLabel>
		<span>Posts</span>
		<Select
			multiple
			size={5}
			bind:value={
				() => value ?? [],
				(v) => value = v.length ? v : undefined
			}
		>
			{#each select.options ?? [] as option}
				<option value={`${option.value}`}>{option.label}</option>
			{/each}
		</Select>
	</FieldLabel>

	<Card>Selected value: {value ?? 'None'}</Card>
</Stack>
