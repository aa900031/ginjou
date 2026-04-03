<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/vue-table'
import { h, resolveComponent } from 'vue'

interface Post {
	id: string
	name: string
	user: string
}

const UButton = resolveComponent('UButton')
const UCheckbox = resolveComponent('UCheckbox')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const table = useTemplateRef('table')
const { records } = await useAsyncList<Post>()

const columnFilters = ref([{ id: 'name', value: '' }])
const rowSelection = ref<Record<string, boolean>>({})
const pagination = ref({
	pageIndex: 0,
	pageSize: 10,
})

const nameFilter = computed({
	get: (): string => {
		return (table.value?.tableApi?.getColumn('name')?.getFilterValue() as string) || ''
	},
	set: (value: string) => {
		table.value?.tableApi?.getColumn('name')?.setFilterValue(value || undefined)
	},
})

function getRowItems(post: Post): DropdownMenuItem[] {
	return [
		{
			label: 'View',
			icon: 'i-lucide-eye',
			onSelect: () => navigateTo(`/posts/${post.id}`),
		},
		{
			label: 'Edit',
			icon: 'i-lucide-pencil',
			onSelect: () => navigateTo(`/posts/${post.id}/edit`),
		},
	]
}

const columns: TableColumn<Post>[] = [
	{
		id: 'select',
		header: ({ table }) => h(UCheckbox, {
			'modelValue': table.getIsSomePageRowsSelected()
				? 'indeterminate'
				: table.getIsAllPageRowsSelected(),
			'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
			'ariaLabel': 'Select all',
		}),
		cell: ({ row }) => h(UCheckbox, {
			'modelValue': row.getIsSelected(),
			'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
			'ariaLabel': 'Select row',
		}),
	},
	{
		accessorKey: 'id',
		header: 'ID',
	},
	{
		accessorKey: 'name',
		header: 'Name',
		cell: ({ row }) => h('div', { class: 'min-w-0' }, [
			h('p', { class: 'font-medium text-highlighted truncate' }, row.original.name),
			h('p', { class: 'text-sm text-muted truncate' }, `Post #${row.original.id}`),
		]),
	},
	{
		accessorKey: 'user',
		header: 'User',
	},
	{
		id: 'actions',
		cell: ({ row }) => h(
			'div',
			{ class: 'text-right' },
			h(
				UDropdownMenu,
				{
					content: { align: 'end' },
					items: getRowItems(row.original),
				},
				() => h(UButton, {
					icon: 'i-lucide-ellipsis-vertical',
					color: 'neutral',
					variant: 'ghost',
					class: 'ml-auto',
				}),
			),
		),
	},
]
</script>

<template>
	<UDashboardPanel id="posts">
		<template #header>
			<UDashboardNavbar title="Posts">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>

				<template #right>
					<UButton
						label="New Post"
						icon="i-lucide-plus"
						to="/posts/create"
					/>
				</template>
			</UDashboardNavbar>
		</template>

		<template #body>
			<div class="flex flex-wrap items-center justify-between gap-1.5">
				<UInput
					v-model="nameFilter"
					class="max-w-sm"
					icon="i-lucide-search"
					placeholder="Search posts..."
				/>
			</div>

			<UTable
				ref="table"
				v-model:column-filters="columnFilters"
				v-model:row-selection="rowSelection"
				v-model:pagination="pagination"
				:pagination-options="{
					getPaginationRowModel: getPaginationRowModel(),
				}"
				:data="records"
				:columns="columns"
				:get-row-id="(row: Post) => row.id"
				class="shrink-0"
				:ui="{
					base: 'table-fixed border-separate border-spacing-0',
					thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
					tbody: '[&>tr]:last:[&>td]:border-b-0',
					th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
					td: 'border-b border-default',
					separator: 'h-0',
				}"
			/>

			<div class="mt-auto flex items-center justify-between gap-3 border-t border-default pt-4">
				<div class="text-sm text-muted">
					{{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
					{{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
				</div>

				<UPagination
					:page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
					:items-per-page="table?.tableApi?.getState().pagination.pageSize"
					:total="table?.tableApi?.getFilteredRowModel().rows.length"
					@update:page="(page: number) => table?.tableApi?.setPageIndex(page - 1)"
				/>
			</div>
		</template>
	</UDashboardPanel>
</template>
