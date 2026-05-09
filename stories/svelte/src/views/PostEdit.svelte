<script lang="ts">
	import { useLocation } from '@ginjou/svelte'
	import { formatLocation } from '../utils/location'
	import Stack from '../components/Stack.svelte'
	import UrlBadge from '../components/UrlBadge.svelte'
	import PageTitle from '../components/PageTitle.svelte'

	const location = useLocation()
</script>

<Stack>
	<UrlBadge url={formatLocation(location.value)} />
	<PageTitle>Post Edit</PageTitle>
</Stack>
