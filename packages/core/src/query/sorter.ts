import type { ValueOf } from 'type-fest'

export const SortOrder = {
	Asc: 'asc',
	Desc: 'desc',
} as const

export type SortOrderValues = ValueOf<typeof SortOrder>

export function isSortOrder(
	value: unknown,
): value is SortOrderValues {
	switch (value) {
		case SortOrder.Asc:
		case SortOrder.Desc:
			return true
		default:
			return false
	}
}

export interface Sort {
	field: string
	order: SortOrderValues
}

export type Sorters = Sort[]

export interface SorterMatcher {
	field: string
	order?: SortOrderValues
}

export function isTargetSorter(
	item: Sort,
	matcher: SorterMatcher,
): boolean {
	return item.field === matcher.field
		&& (matcher.order === undefined || item.order === matcher.order)
}

export function selectSorters(
	items: Sorters,
	matcher: SorterMatcher,
): Sorters {
	return items.filter(item => isTargetSorter(item, matcher))
}

export function findSorter(
	items: Sorters,
	matcher: SorterMatcher,
): Sort | undefined {
	return items.find(item => isTargetSorter(item, matcher))
}
