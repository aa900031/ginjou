<script setup lang="ts">
const state = reactive<Record<string, boolean>>({
	new_orders: true,
	payment_failures: true,
	refunded_orders: false,
	daily_digest: true,
})

const sections = [
	{
		title: 'Order flow',
		description: 'Choose which operational events should trigger a notification.',
		fields: [
			{ name: 'new_orders', label: 'New orders', description: 'Receive a notification for every new order.' },
			{ name: 'payment_failures', label: 'Payment failures', description: 'Get alerted when an order remains unpaid.' },
			{ name: 'refunded_orders', label: 'Refunded orders', description: 'Track refunds without checking the table.' },
		],
	},
	{
		title: 'Digests',
		description: 'Reduce dashboard noise with summary notifications.',
		fields: [
			{ name: 'daily_digest', label: 'Daily digest', description: 'Receive a daily summary of order volume.' },
		],
	},
]
</script>

<template>
	<div v-for="section in sections" :key="section.title">
		<UPageCard :title="section.title" :description="section.description" variant="naked" class="mb-4" />

		<UPageCard variant="subtle" :ui="{ container: 'divide-y divide-default' }">
			<UFormField
				v-for="field in section.fields"
				:key="field.name"
				:name="field.name"
				:label="field.label"
				:description="field.description"
				class="flex items-center justify-between not-last:pb-4 gap-2"
			>
				<USwitch v-model="state[field.name]" />
			</UFormField>
		</UPageCard>
	</div>
</template>
