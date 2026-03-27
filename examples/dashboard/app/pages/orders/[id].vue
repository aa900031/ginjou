<script setup lang="ts">
import type { Order } from '~/types/orders'

const route = useRoute()
const id = computed(() => Number(route.params.id))

const { record: order } = await useAsyncGetOne<Order>({
	resource: 'orders',
	id,
})

function formatCurrency(value: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0,
	}).format(value)
}
</script>

<template>
	<UDashboardPanel id="order-show">
		<template #header>
			<UDashboardNavbar :title="order?.number || 'Order'">
				<template #leading>
					<UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" to="/orders" />
				</template>
				<template #right>
					<UButton color="neutral" label="Edit" :to="`/orders/${order?.id}/edit`" />
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<div v-if="order" class="grid gap-4 lg:grid-cols-[2fr_1fr]">
				<UPageCard title="Customer" variant="subtle">
					<div class="space-y-4">
						<div>
							<p class="text-sm text-muted">Name</p>
							<p class="font-medium text-highlighted">{{ order.customerName }}</p>
						</div>
						<div>
							<p class="text-sm text-muted">Email</p>
							<p>{{ order.customerEmail }}</p>
						</div>
						<div>
							<p class="text-sm text-muted">Notes</p>
							<p>{{ order.notes || 'No notes yet.' }}</p>
						</div>
					</div>
				</UPageCard>

				<div class="space-y-4">
					<UPageCard title="Summary" variant="subtle">
						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<span class="text-muted">Status</span>
								<OrderStatusBadge :status="order.status" />
							</div>
							<div class="flex items-center justify-between">
								<span class="text-muted">Channel</span>
								<span class="capitalize">{{ order.channel }}</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-muted">Items</span>
								<span>{{ order.itemCount }}</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-muted">Total</span>
								<span class="font-semibold text-highlighted">{{ formatCurrency(order.total) }}</span>
							</div>
						</div>
					</UPageCard>

					<UPageCard title="Timeline" variant="subtle">
						<div class="space-y-3 text-sm">
							<div>
								<p class="text-muted">Created</p>
								<p>{{ new Date(order.createdAt).toLocaleString() }}</p>
							</div>
							<div>
								<p class="text-muted">Updated</p>
								<p>{{ new Date(order.updatedAt).toLocaleString() }}</p>
							</div>
						</div>
					</UPageCard>
				</div>
			</div>
		</template>
	</UDashboardPanel>
</template>
