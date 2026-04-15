<script setup lang="ts">
const resource = ref('posts')
const id = ref('1')
const { record } = await useAsyncGetOne({
	resource,
	id,
})
</script>

<template>
	<UDashboardPanel>
		<template #header>
			<UDashboardNavbar title="Other" />
		</template>

		<div class="p-4 lg:p-6 space-y-4">
			<UCard>
				<div class="space-y-4">
					<UFormField label="Resource">
						<div class="flex gap-4">
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									v-model="resource"
									type="radio"
									value="posts"
									class="accent-primary"
								>
								<span class="text-sm">Posts</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									v-model="resource"
									type="radio"
									value="users"
									class="accent-primary"
								>
								<span class="text-sm">Users</span>
							</label>
						</div>
					</UFormField>

					<UFormField label="ID">
						<UInput v-model="id" class="w-full max-w-xs" />
					</UFormField>
				</div>
			</UCard>

			<UCard>
				<pre class="text-sm text-muted overflow-auto">{{ record }}</pre>
			</UCard>
		</div>
	</UDashboardPanel>
</template>
