<script setup lang="ts">
import defineAuth from '~/ginjou/auth'
import defineAuthz from '~/ginjou/authz'
import defineController from '~/ginjou/controller'
import defineFetcher from '~/ginjou/fetcher'
import defineQueryClient from '~/ginjou/query'

defineFetcher()
defineQueryClient()
defineController()
defineAuth()
defineAuthz()
</script>

<template>
	<UApp>
		<NuxtRouteAnnouncer />
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</UApp>
</template>
