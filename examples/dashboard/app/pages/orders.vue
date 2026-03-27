<script setup lang="ts">
import { FilterOperator, SortOrder } from '@ginjou/core'
import type { TableColumn } from '@nuxt/ui'
import type { Order } from '~/types/orders'

const q = ref('')
const status = ref<'all' | Order['status']>('all')
const sort = ref<'createdAt:desc' | 'total:desc' | 'total:asc'>('createdAt:desc')

const { records, currentPage, pageCount, total, isFetching, setFilters, setSorters } = await useAsyncList<Order>({
	resource: 'orders',
	pagination: {
		current: 1,
		perPage: 8,
		mode: 'server',
	},
	sorters: {
		value: [{ field: 'createdAt', order: SortOrder.Desc }],
	},
	filters: {
		value: [],
	},
})

watch([q, status], () => {
	const filters = [] as Array<{ field: string, operator: typeof FilterOperator.eq, value: string }>

	if (q.value.trim()) {
		filters.push({
			field: 'q',
			operator: FilterOperator.eq,
			value: q.value.trim(),
		})
	}

	if (status.value !== 'all') {
		filters.push({
			field: 'status',
			operator: FilterOperator.eq,
			value: status.value,
		})
	}

	setFilters(filters)
}, {
	immediate: true,
})

watch(sort, (value) => {
	const [field, order] = value.split(':') as ['createdAt' | 'total', 'asc' | 'desc']

	setSorters([
		{
			field,
			order,
		},
	])
}, {
	immediate: true,
})

const columns: TableColumn<Order>[] = [
	{
		accessorKey: 'number',
		header: 'Order',
		cell: ({ row }) => {
			const order = row.original

			return h(resolveComponent('NuxtLink'), {
				to: `/orders/${order.id}`,
				class: 'font-medium text-highlighted hover:underline',
			}, () => order.number)
		},
	},
	{
		accessorKey: 'customerName',
		header: 'Customer',
		cell: ({ row }) => {
			const order = row.original

			return h('div', [
				h('p', { class: 'font-medium text-highlighted' }, order.customerName),
				h('p', { class: 'text-xs text-muted' }, order.customerEmail),
			])
		},
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => h(resolveComponent('OrderStatusBadge'), { status: row.getValue('status') as Order['status'] }),
	},
	{
		accessorKey: 'channel',
		header: 'Channel',
		cell: ({ row }) => h('span', { class: 'capitalize' }, row.getValue('channel') as string),
	},
	{
		accessorKey: 'total',
		header: () => h('div', { class: 'text-right' }, 'Total'),
		cell: ({ row }) => h('div', { class: 'text-right font-medium' }, formatCurrency(Number(row.getValue('total')))),
	},
	{
		id: 'actions',
		header: '',
		cell: ({ row }) => h('div', { class: 'flex justify-end' }, [
			h(resolveComponent('UButton'), {
				to: `/orders/${row.original.id}/edit`,
				label: 'Edit',
				color: 'neutral',
				variant: 'ghost',
				size: 'xs',
			}),
		]),
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
	<UDashboardPanel id="orders">
		<template #header>
			<UDashboardNavbar title="Orders" :badge="String(total ?? 0)">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>
			</UDashboardNavbar>

			<UDashboardToolbar>
				<div class="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
					<UInput v-model="q" icon="i-lucide-search" placeholder="Search orders" class="w-full sm:max-w-sm" />
					<USelect v-model="status" :items="['all', 'paid', 'pending', 'refunded']" class="w-full sm:w-44 capitalize" />
					<USelect
						v-model="sort"
						:items="[
							{ label: 'Newest first', value: 'createdAt:desc' },
							{ label: 'Highest total', value: 'total:desc' },
							{ label: 'Lowest total', value: 'total:asc' },
						]"
						class="w-full sm:w-44"
					/>
				</div>
			</UDashboardToolbar>
		</template>

		<template #body>
			<UPageCard
				title="Order list"
				description="This table is driven by useAsyncList and the mock REST provider."
			>
				<UTable :loading="isFetching" :data="records ?? []" :columns="columns" />

				<div class="mt-4 flex items-center justify-between">
					<p class="text-sm text-muted">Page {{ currentPage }} of {{ pageCount || 1 }}</p>
					<div class="flex gap-2">
						<UButton color="neutral" variant="subtle" :disabled="currentPage <= 1" @click="currentPage -= 1">Previous</UButton>
						<UButton color="neutral" variant="subtle" :disabled="!pageCount || currentPage >= pageCount" @click="currentPage += 1">Next</UButton>
					</div>
				</div>
			</UPageCard>
		</template>
	</UDashboardPanel>
</template>
