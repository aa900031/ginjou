<script setup lang="ts">
const { record } = await useAsyncShow()
</script>

<template>
	<UDashboardPanel>
		<template #header>
			<UDashboardNavbar :title="`Post #${record!.id}`">
				<template #trailing>
					<UButton
						label="Edit"
						icon="i-lucide-pencil"
						color="neutral"
						variant="outline"
						:to="`/posts/${record!.id}/edit`"
					/>
				</template>
			</UDashboardNavbar>
		</template>

		<div class="p-4 lg:p-6">
			<UCard>
				<dl class="divide-y divide-default">
					<div class="px-4 py-3 flex gap-4">
						<dt class="text-sm font-medium text-muted w-24 shrink-0">
							ID
						</dt>
						<dd class="text-sm text-highlighted">
							{{ record!.id }}
						</dd>
					</div>
					<div class="px-4 py-3 flex gap-4">
						<dt class="text-sm font-medium text-muted w-24 shrink-0">
							Name
						</dt>
						<dd class="text-sm text-highlighted">
							{{ record!.name }}
						</dd>
					</div>
					<div class="px-4 py-3 flex gap-4">
						<dt class="text-sm font-medium text-muted w-24 shrink-0">
							User
						</dt>
						<dd class="text-sm text-highlighted">
							{{ record!.user }}
						</dd>
					</div>
				</dl>
			</UCard>
		</div>
	</UDashboardPanel>
</template>
