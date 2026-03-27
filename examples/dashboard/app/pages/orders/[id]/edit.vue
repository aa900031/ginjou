<script setup lang="ts">
import type { Order } from '~/types/orders'

const route = useRoute()
const toast = useToast()
const id = computed(() => Number(route.params.id))

const { record: order } = await useAsyncGetOne<Order>({
	resource: 'orders',
	id,
})

const state = reactive({
	status: 'pending' as Order['status'],
	channel: 'web' as Order['channel'],
	notes: '',
})

watch(order, (value) => {
	if (!value) {
		return
	}

	state.status = value.status
	state.channel = value.channel
	state.notes = value.notes || ''
}, {
	immediate: true,
})

const { mutateAsync: update, isPending } = useUpdateOne<Order, Pick<Order, 'status' | 'channel' | 'notes'>>({
	resource: 'orders',
	id,
})

async function onSubmit() {
	await update({
		params: {
			status: state.status,
			channel: state.channel,
			notes: state.notes,
		},
	})

	toast.add({
		title: 'Order updated',
		description: `Saved ${order.value?.number}.`,
		color: 'success',
	})

	await navigateTo(`/orders/${id.value}`)
	}
</script>

<template>
	<UDashboardPanel id="order-edit">
		<template #header>
			<UDashboardNavbar :title="order?.number ? `Edit ${order.number}` : 'Edit order'">
				<template #leading>
					<UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" :to="`/orders/${id}`" />
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<UPageCard title="Order controls" description="Update the editable fields exposed by the mock REST API." variant="subtle">
				<UForm :state="state" class="space-y-4" @submit="onSubmit">
					<UFormField label="Status" name="status">
						<USelect v-model="state.status" :items="['paid', 'pending', 'refunded']" class="w-full capitalize" />
					</UFormField>

					<UFormField label="Channel" name="channel">
						<USelect v-model="state.channel" :items="['web', 'marketplace', 'pos']" class="w-full capitalize" />
					</UFormField>

					<UFormField label="Internal notes" name="notes">
						<UTextarea v-model="state.notes" :rows="5" autoresize />
					</UFormField>

					<div class="flex justify-end">
						<UButton type="submit" color="neutral" :loading="isPending" label="Save changes" />
					</div>
				</UForm>
			</UPageCard>
		</template>
	</UDashboardPanel>
</template>
