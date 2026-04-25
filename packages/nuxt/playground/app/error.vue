<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
	error: NuxtError
}>()

useSeoMeta({
	title: 'Page not found',
	description: 'We are sorry but this page could not be found.',
})

useHead({
	htmlAttrs: {
		lang: 'en',
	},
})
</script>

<template>
	<UApp>
		<UError :error="error" />
	</UApp>
</template>

<!-- <script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
	error: NuxtError
}>()

const isUnauthorized = computed(() => props.error.statusCode === 401)
</script>

<template>
	<UApp>
		<div class="min-h-screen flex items-center justify-center px-4">
			<div class="text-center space-y-6 max-w-sm">
				<div class="flex justify-center">
					<UIcon
						:name="isUnauthorized ? 'i-lucide-lock' : 'i-lucide-circle-x'"
						class="size-16 text-muted"
					/>
				</div>

				<div class="space-y-2">
					<h1 class="text-2xl font-semibold text-highlighted">
						{{ isUnauthorized ? 'Unauthorized' : `Error ${error.statusCode}` }}
					</h1>
					<p class="text-sm text-muted">
						{{ isUnauthorized ? 'You must be logged in to access this page.' : error.message }}
					</p>
				</div>

				<UButton
					v-if="isUnauthorized"
					label="Go to Login"
					icon="i-lucide-log-in"
					size="lg"
					@click="clearError({ redirect: '/login' })"
				/>
				<UButton
					v-else
					label="Go back"
					icon="i-lucide-arrow-left"
					color="neutral"
					variant="outline"
					size="lg"
					@click="clearError({ redirect: '/' })"
				/>
			</div>
		</div>
	</UApp>
</template> -->
