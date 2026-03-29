<script setup lang="ts">
import defineAuth from '~/ginjou/auth'
import defineAuthz from '~/ginjou/authz'
import defineFetcher from '~/ginjou/fetcher'
import defineQueryClient from '~/ginjou/query'
import defineResources from '~/ginjou/resource'

defineFetcher()
defineQueryClient()
defineResources()
defineAuth()
defineAuthz()
</script>

<template>
	<NuxtRouteAnnouncer />
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
