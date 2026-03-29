<script setup lang="ts">
const { options } = await useAsyncSelect({
	resource: 'users',
	labelKey: 'name',
	valueKey: 'id',
})

const { record, save } = await useAsyncEdit()

const formData = reactive({
	name: unref(record)?.name,
	user: unref(record)?.user ?? unref(options)?.[0]?.value,
})

const hasChanges = computed(() => {
	return formData.name !== unref(record)?.name || formData.user !== (unref(record)?.user ?? unref(options)?.[0]?.value)
})

async function handleSubmit() {
	await save(formData)
}
</script>

<template>
	<UDashboardPanel>
		<template #header>
			<UDashboardNavbar title="Edit Post">
				<template #leading>
					<UButton
						icon="i-lucide-arrow-left"
						color="neutral"
						variant="ghost"
						:to="`/posts/${record!.id}`"
					/>
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
							Keep the record clear and consistent with the rest of the dashboard dataset.
						</p>
					</div>
				</template>

				<form
					class="space-y-6"
					@submit.prevent="handleSubmit"
				>
					<UFormField label="Name" name="name" description="Used in the posts list, the detail page title, and all related links.">
						<UInput
							v-model="formData.name"
							class="w-full"
							size="xl"
							placeholder="Enter post name"
						/>
					</UFormField>

					<UFormField label="User" name="user" description="Controls which demo user this record is associated with.">
						<USelect
							v-model="formData.user"
							:items="options?.map(o => ({ label: o.label, value: o.value }))"
							class="w-full"
							size="xl"
						/>
					</UFormField>

					<div class="flex flex-wrap items-center justify-end gap-3 border-t border-default pt-5">
						<UButton
							label="View Post"
							color="neutral"
							variant="outline"
							:to="`/posts/${record!.id}`"
						/>
						<UButton
							type="submit"
							label="Save changes"
							icon="i-lucide-save"
							:disabled="!hasChanges"
						/>
					</div>
				</form>
			</UCard>
		</template>
	</UDashboardPanel>
</template>
