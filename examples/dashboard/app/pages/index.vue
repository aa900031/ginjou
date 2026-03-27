<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Order } from '~/types/orders'

const { records } = await useAsyncGetList<Order>({
	resource: 'orders',
})

const orders = computed(() => records.value ?? [])
const revenue = computed(() => orders.value.reduce((sum, order) => sum + order.total, 0))
const averageOrderValue = computed(() => orders.value.length ? revenue.value / orders.value.length : 0)
const paidOrders = computed(() => orders.value.filter(order => order.status === 'paid').length)
const pendingOrders = computed(() => orders.value.filter(order => order.status === 'pending').length)
const recentOrders = computed(() => [...orders.value]
	.sort((left, right) => right.createdAt.localeCompare(left.createdAt))
	.slice(0, 5))

const columns: TableColumn<Order>[] = [
	{
		accessorKey: 'number',
		header: 'Order',
	},
	{
		accessorKey: 'customerName',
		header: 'Customer',
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => h(resolveComponent('OrderStatusBadge'), { status: row.getValue('status') as Order['status'] }),
	},
	{
		accessorKey: 'total',
		header: () => h('div', { class: 'text-right' }, 'Total'),
		cell: ({ row }) => h('div', { class: 'text-right font-medium' }, formatCurrency(Number(row.getValue('total')))),
	},
]

function formatCurrency(value: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0,
	}).format(value)
}
</script>

<template>
	<UDashboardPanel id="home">
		<template #header>
			<UDashboardNavbar title="Overview" :ui="{ right: 'gap-3' }">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>
				<template #right>
					<UButton label="Open orders" color="neutral" to="/orders" />
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<div class="grid gap-4 lg:grid-cols-4">
				<UCard>
					<p class="text-sm text-muted">Revenue</p>
					<p class="mt-2 text-3xl font-semibold text-highlighted">{{ formatCurrency(revenue) }}</p>
				</UCard>
				<UCard>
					<p class="text-sm text-muted">Average order</p>
					<p class="mt-2 text-3xl font-semibold text-highlighted">{{ formatCurrency(averageOrderValue) }}</p>
				</UCard>
				<UCard>
					<p class="text-sm text-muted">Paid orders</p>
					<p class="mt-2 text-3xl font-semibold text-highlighted">{{ paidOrders }}</p>
				</UCard>
				<UCard>
					<p class="text-sm text-muted">Pending review</p>
					<p class="mt-2 text-3xl font-semibold text-highlighted">{{ pendingOrders }}</p>
				</UCard>
			</div>

			<UPageCard
				title="Recent orders"
				description="The latest orders from the mock REST API, queried through Ginjou."
				class="mt-6"
			>
				<UTable :data="recentOrders" :columns="columns" />
			</UPageCard>
		</template>
	</UDashboardPanel>
</template>
