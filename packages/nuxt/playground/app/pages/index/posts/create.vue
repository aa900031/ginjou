<script setup lang="ts">
const { save, isLoading } = useCreate<
	{ id: string, name: string, user: string },
	{ name: string }
>()

const formData = reactive({
	name: '',
})

const hasName = computed(() => formData.name.trim().length > 0)

async function handleSubmit() {
	await save(formData)
}
</script>

<template>
	<UDashboardPanel>
		<template #header>
			<UDashboardNavbar title="New Post">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<UCard>
				<template #header>
					<div class="space-y-1">
						<h2 class="text-base font-semibold text-highlighted">
							Post details
						</h2>
						<p class="text-sm text-muted">
							Use a clear internal name so the record is easy to identify from the dashboard list.
						</p>
					</div>
				</template>

				<form class="space-y-6" @submit.prevent="handleSubmit">
					<UFormField label="Name" name="name" description="Shown as the main label in the posts table and detail page.">
						<UInput
							v-model="formData.name"
							class="w-full"
							placeholder="Summer campaign landing copy"
							size="xl"
						/>
					</UFormField>

					<div class="flex flex-wrap items-center justify-end gap-3 border-t border-default pt-5">
						<UButton
							label="Cancel"
							color="neutral"
							variant="outline"
							to="/posts"
						/>
						<UButton
							type="submit"
							label="Create Post"
							icon="i-lucide-plus"
							:loading="isLoading"
							:disabled="!hasName"
						/>
					</div>
				</form>
			</UCard>
		</template>
	</UDashboardPanel>
</template>
