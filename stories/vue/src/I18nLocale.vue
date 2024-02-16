<script setup lang="ts">
import { useLocale, useTranslate } from '@ginjou/vue'

const locale = useLocale()
const t = useTranslate()
</script>

<template>
	Locale: {{ locale }}<br>
	<ul>
		<li>
			'hi' >>> {{ t('hi') }}<br>
		</li>
		<li>
			'msg' >>> {{ t('msg', { name: 'Mark' }) }}<br>
		</li>
	</ul>
	<select v-model="locale">
		<option value="en-US">
			en-US
		</option>
		<option value="zh-TW">
			zh-TW
		</option>
	</select>
</template>
