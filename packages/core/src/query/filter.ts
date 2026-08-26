import type { ValueOf } from 'type-fest'

export const FilterOperator = {
	eq: 'eq',
	ne: 'ne',
	lt: 'lt',
	gt: 'gt',
	lte: 'lte',
	gte: 'gte',
	in: 'in',
	nin: 'nin',
	contains: 'contains',
	ncontains: 'ncontains',
	containss: 'containss',
	ncontainss: 'ncontainss',
	between: 'between',
	nbetween: 'nbetween',
	null: 'null',
	nnull: 'nnull',
	startswith: 'startswith',
	nstartswith: 'nstartswith',
	startswiths: 'startswiths',
	nstartswiths: 'nstartswiths',
	endswith: 'endswith',
	nendswith: 'nendswith',
	endswiths: 'endswiths',
	nendswiths: 'nendswiths',
	or: 'or',
	and: 'and',
} as const

export type FilterOperatorValues = ValueOf<typeof FilterOperator>

export interface LogicalFilter {
	field: string
	operator: Exclude<FilterOperatorValues, 'or' | 'and'>
	value: any
}

export interface ConditionalFilter {
	key?: string
	operator: Extract<FilterOperatorValues, 'or' | 'and'>
	value: (LogicalFilter | ConditionalFilter)[]
}

export type Filter = (LogicalFilter | ConditionalFilter)

export type Filters = Filter[]

export function isLogicalFilter(
	item: Filter,
): item is LogicalFilter {
	return isLogicalFilterOperator(item.operator)
}

export function isConditionalFilter(
	item: Filter,
): item is ConditionalFilter {
	return isConditionalFilterOperator(item.operator)
}

export interface FilterMatcher {
	field: string
	operator?: FilterOperatorValues
}

export function isTargetFilter(
	item: Filter,
	matcher: FilterMatcher,
): boolean {
	return isLogicalFilter(item)
		&& item.field === matcher.field
		&& (matcher.operator === undefined || item.operator === matcher.operator)
}

export function selectFilters(
	items: Filters,
	matcher: FilterMatcher,
	options?: {
		deep?: boolean
	},
): Filters {
	const result: Filters = []

	for (const item of items) {
		if (options?.deep && isConditionalFilter(item)) {
			const value = selectFilters(item.value, matcher, options)
			if (value.length)
				result.push({ ...item, value })
		}
		else if (isTargetFilter(item, matcher)) {
			result.push(item)
		}
	}

	return result
}

export function findFilter(
	items: Filters,
	matcher: FilterMatcher,
	options?: {
		deep?: boolean
	},
): Filter | undefined {
	for (const item of items) {
		if (options?.deep && isConditionalFilter(item)) {
			const result = findFilter(item.value, matcher, options)
			if (result)
				return result
		}
		else if (isTargetFilter(item, matcher)) {
			return item
		}
	}
}

export function isFilterOperator(
	operator: unknown,
): operator is FilterOperatorValues {
	return typeof operator === 'string' && Object.hasOwn(FilterOperator, operator)
}

export function isConditionalFilterOperator(
	operator: unknown,
): operator is ConditionalFilter['operator'] {
	switch (operator) {
		case FilterOperator.and:
		case FilterOperator.or:
			return true
		default:
			return false
	}
}

export function isLogicalFilterOperator(
	operator: unknown,
): operator is LogicalFilter['operator'] {
	return !isConditionalFilterOperator(operator) && isFilterOperator(operator)
}
