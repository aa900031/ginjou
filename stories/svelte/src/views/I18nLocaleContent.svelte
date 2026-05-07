<script lang="ts">
	import { useLocale, useTranslate } from '@ginjou/svelte'

	const locale = useLocale()
	const t = useTranslate()
</script>

<div class="stack">
	<h1>useLocale / useTranslate</h1>

	<div class="card stack">
		<p>Locale: {locale.value}</p>

		<ul>
			<li>'hi' >>> {t('hi')}</li>
			<li>'msg' >>> {t('msg', { name: 'Mark' })}</li>
		</ul>

		<label>
			<span>Locale</span>
			<select
				data-testid="locale-selector"
				value={locale.value}
				onchange={(event) => {
					locale.value = (event.currentTarget as HTMLSelectElement).value
				}}
			>
				<option value="en-US">en-US</option>
				<option value="zh-TW">zh-TW</option>
			</select>
		</label>
	</div>
</div>
