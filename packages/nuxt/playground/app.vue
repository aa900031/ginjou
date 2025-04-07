<script setup lang="ts">
import defineFetcher from '~/ginjou/fetcher'
import defineQueryClient from '~/ginjou/query'
import defineResources from '~/ginjou/resource'

defineFetcher()
defineQueryClient()
defineResources()
</script>

<template>
	<NuxtRouteAnnouncer />
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
