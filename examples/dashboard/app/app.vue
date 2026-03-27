<script setup lang="ts">
import { defineFetchersContext, defineQueryClientContext } from '@ginjou/vue'
import { createFetcher } from '@ginjou/with-rest-api'
import { QueryClient } from '@tanstack/vue-query'

defineQueryClientContext(new QueryClient())
defineFetchersContext({
	default: createFetcher({
		url: '/api',
	}),
})

const colorMode = useColorMode()
const color = computed(() => colorMode.value === 'dark' ? '#18181b' : '#ffffff')

useHead({
	meta: [
		{ charset: 'utf-8' },
		{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
		{ key: 'theme-color', name: 'theme-color', content: color },
	],
	htmlAttrs: {
		lang: 'en',
	},
})

useSeoMeta({
	title: 'Ginjou Dashboard Example',
	description: 'Nuxt UI dashboard shell powered by Ginjou with a mock orders REST API.',
})
</script>

<template>
	<UApp>
		<NuxtLoadingIndicator />
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</UApp>
</template>
