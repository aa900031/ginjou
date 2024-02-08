import type { Sorters } from '@ginjou/core'

export function genSorters(
	sorters?: Sorters,
): {
		sorts: string[]
		orders: string[]
		_sort: string
		_order: string
	} | undefined {
	if (!sorters || !sorters.length)
		return

	const sorts: string[] = []
	const orders: string[] = []

	sorters.forEach((item) => {
		sorts.push(item.field)
		orders.push(item.order)
	})

	return {
		sorts,
		orders,
		_sort: sorts.join(','),
		_order: orders.join(','),
	}
};
