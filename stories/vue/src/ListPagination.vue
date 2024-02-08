<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useList } from '@ginjou/vue'

const route = useRoute()

const {
	isLoading,
	pageCount,
	perPage,
	currentPage,
	filters,
	sorters,
} = useList({
	syncRoute: true,
})
</script>

<template>
	<template v-if="isLoading">
		Loading...
	</template>
	<template v-else>
		{{ route.fullPath }}<br>
		pageCount: {{ pageCount }}<br>
		perPage: {{ perPage }}<br>
		currentPage: {{ currentPage }}<br>
		filters: {{ filters }}<br>
		sorters: {{ sorters }}<br>
	</template>
</template>
