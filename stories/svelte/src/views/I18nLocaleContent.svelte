<script lang="ts">
	import { useLocale, useTranslate } from '@ginjou/svelte'
	import Card from '../components/Card.svelte'
	import FieldLabel from '../components/FieldLabel.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Select from '../components/Select.svelte'
	import Stack from '../components/Stack.svelte'

	const locale = useLocale()
	const t = useTranslate()
</script>

<Stack>
	<PageTitle>useLocale / useTranslate</PageTitle>

	<Card>
		<Stack>
			<p>Locale: {locale.value}</p>

			<ul>
				<li>'hi' >>> {t('hi')}</li>
				<li>'msg' >>> {t('msg', { name: 'Mark' })}</li>
			</ul>

			<FieldLabel>
				<span>Locale</span>
				<Select data-testid="locale-selector" bind:value={locale.value}>
					<option value="en-US">en-US</option>
					<option value="zh-TW">zh-TW</option>
				</Select>
			</FieldLabel>
		</Stack>
	</Card>
</Stack>
