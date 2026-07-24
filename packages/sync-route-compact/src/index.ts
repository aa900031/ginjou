import type { ConditionalFilter, Filter, Filters, Sorters } from '@ginjou/core'
import { FilterOperator } from '@ginjou/core'
import * as JSURL from 'jsurl2'

type PackedFilter = [field: string, operator: string, value: unknown]
	| [operator: ConditionalFilter['operator'], value: PackedFilter[], key?: string]

const logicalOperators = new Set<string>(
	Object.values(FilterOperator).filter(operator =>
		operator !== FilterOperator.and && operator !== FilterOperator.or),
)

function invalid(kind: string): never {
	throw new Error(`[@ginjou/sync-route-compact] Invalid ${kind}`)
}

function packFilter(filter: Filter): PackedFilter {
	if ('field' in filter)
		return [filter.field, filter.operator, filter.value]

	return filter.key === undefined
		? [filter.operator, filter.value.map(packFilter)]
		: [filter.operator, filter.value.map(packFilter), filter.key]
}

function unpackFilter(value: unknown): Filter {
	if (!Array.isArray(value))
		return invalid('filter')

	const [first, second, third] = value
	if (
		(first === FilterOperator.and || first === FilterOperator.or)
		&& Array.isArray(second)
	) {
		if (
			value.length < 2
			|| value.length > 3
			|| (third !== undefined && typeof third !== 'string')
		) {
			return invalid('conditional filter')
		}

		return {
			...(third === undefined ? {} : { key: third }),
			operator: first,
			value: second.map(unpackFilter),
		}
	}

	if (
		value.length !== 3
		|| typeof first !== 'string'
		|| typeof second !== 'string'
		|| !logicalOperators.has(second)
	) {
		return invalid('logical filter')
	}

	return {
		field: first,
		operator: second as Exclude<Filter['operator'], 'or' | 'and'>,
		value: third,
	}
}

export function stringifyFilters(value: Filters): string {
	return JSURL.stringify(value.map(packFilter), { rich: true, short: true })
}

export function parseFilters(value: string): Filters {
	if (value === '')
		return []

	const parsed = JSURL.parse<unknown>(value, { deURI: true })
	if (!Array.isArray(parsed))
		return invalid('filters')
	return parsed.map(unpackFilter)
}

export function stringifySorters(value: Sorters): string {
	return JSURL.stringify(
		value.map(({ field, order }) => [field, order]),
		{ rich: true, short: true },
	)
}

export function parseSorters(value: string): Sorters {
	if (value === '')
		return []

	const parsed = JSURL.parse<unknown>(value, { deURI: true })
	if (!Array.isArray(parsed))
		return invalid('sorters')

	return parsed.map((sorter) => {
		if (
			!Array.isArray(sorter)
			|| sorter.length !== 2
			|| typeof sorter[0] !== 'string'
			|| (sorter[1] !== 'asc' && sorter[1] !== 'desc')
		) {
			return invalid('sorter')
		}

		return {
			field: sorter[0],
			order: sorter[1],
		}
	})
}

export const filters = {
	parse: parseFilters,
	stringify: stringifyFilters,
}

export const sorters = {
	parse: parseSorters,
	stringify: stringifySorters,
}
