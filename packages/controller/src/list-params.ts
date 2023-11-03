import mitt from 'mitt'
import { klona } from 'klona/lite'
import { SortOrder } from '@ginjou/query'
import type { Filters, Pagination, Sorters } from '@ginjou/query'

export interface ListParams {
	pagination: Pagination
	filters: Filters | null
	sorters: Sorters | null
}

export interface PartialListParams {
	pagination?: Partial<ListParams['pagination']>
	filters?: ListParams['filters']
	sorters?: ListParams['sorters']
}

const DEFAULT_LIST_PARAMS: ListParams = {
	pagination: {
		current: 1,
		perPage: 10,
	},
	filters: null,
	sorters: [
		{
			field: 'id',
			order: SortOrder.Asc,
		},
	],
}

export const ListParamsEvents = {
	Change: 'change',
} as const

export function createListParams(
	initValue: PartialListParams = {},
) {
	let value: ListParams = merge(DEFAULT_LIST_PARAMS, initValue)

	const emitter = mitt<{
		[ListParamsEvents.Change]: {
			value: ListParams
		}
	}>()

	function getValue() {
		return value
	}

	function setValue(val: PartialListParams) {
		value = merge(value, val)
		emitter.emit(ListParamsEvents.Change, { value })
	}

	function setPagination(val: NonNullable<PartialListParams['pagination']>) {
		setValue({ pagination: val })
	}

	function setFilters(val: NonNullable<PartialListParams['filters']> | null) {
		setValue({
			pagination: {
				current: 1,
			},
			filters: val,
		})
	}

	function setSorters(val: NonNullable<PartialListParams['sorters']> | null) {
		setValue({
			pagination: {
				current: 1,
			},
			sorters: val,
		})
	}

	function setPage(val: NonNullable<NonNullable<PartialListParams['pagination']>['current']>) {
		setValue({ pagination: { current: val } })
	}

	function setPerPage(val: NonNullable<NonNullable<PartialListParams['pagination']>['perPage']>) {
		setValue({ pagination: { perPage: val } })
	}

	return {
		on: emitter.on,
		off: emitter.off,
		getValue,
		setValue,
		setPagination,
		setFilters,
		setSorters,
		setPage,
		setPerPage,
	}
}

function merge(
	prev: ListParams,
	next: PartialListParams,
): ListParams {
	return {
		pagination: {
			current: next.pagination?.current ?? prev.pagination.current,
			perPage: next.pagination?.perPage ?? prev.pagination.perPage,
		},
		filters: next.filters === null ? null : klona(next.filters ?? prev.filters),
		sorters: next.sorters === null ? null : klona(next.sorters ?? prev.sorters),
	}
}
