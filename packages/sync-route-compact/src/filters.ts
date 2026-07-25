import type { ConditionalFilter, Filter, Filters } from '@ginjou/core'
import { isConditionalFilterOperator, isLogicalFilterOperator } from '@ginjou/core'
import * as JSURL from 'jsurl2'
import { invalid, parseArray, stringifyOptions } from './utils'

type PackedFilter = [field: string, operator: string, value: unknown]
	| [operator: ConditionalFilter['operator'], value: PackedFilter[], key?: string]

function packFilter(filter: Filter): PackedFilter {
	if ('field' in filter)
		return [filter.field, filter.operator, filter.value]

	return filter.key === undefined
		? [filter.operator, filter.value.map(packFilter)]
		: [filter.operator, filter.value.map(packFilter), filter.key]
}

function unpackFilter(value: unknown): Filter {
	if (!Array.isArray(value))
		return invalid('filter', value)

	const [first, second, third] = value
	if (isConditionalFilterOperator(first) && Array.isArray(second)) {
		if (
			value.length > 3
			|| (third !== undefined && typeof third !== 'string')
		) {
			return invalid('conditional filter', value)
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
		|| !isLogicalFilterOperator(second)
	) {
		return invalid('logical filter', value)
	}

	return {
		field: first,
		operator: second,
		value: third,
	}
}

export function stringifyFilters(value: Filters): string {
	return JSURL.stringify(value.map(packFilter), stringifyOptions)
}

export function parseFilters(value: string): Filters {
	return parseArray(value, 'filters').map(unpackFilter)
}

export const filters = {
	parse: parseFilters,
	stringify: stringifyFilters,
}
