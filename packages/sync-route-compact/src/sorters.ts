import type { Sort, Sorters, SortOrderValues } from '@ginjou/core'
import { isSortOrder } from '@ginjou/core'
import * as JSURL from 'jsurl2'
import { invalid, parseArray, stringifyOptions } from './utils'

type PackedSorter = [field: string, order: SortOrderValues]

function packSorter(sorter: Sort): PackedSorter {
	return [sorter.field, sorter.order]
}

function unpackSorter(value: unknown): Sort {
	if (
		!Array.isArray(value)
		|| value.length !== 2
		|| typeof value[0] !== 'string'
		|| !isSortOrder(value[1])
	) {
		return invalid('sorter', value)
	}

	return {
		field: value[0],
		order: value[1],
	}
}

export function stringifySorters(value: Sorters): string {
	return JSURL.stringify(value.map(packSorter), stringifyOptions)
}

export function parseSorters(value: string): Sorters {
	return parseArray(value, 'sorters').map(unpackSorter)
}

export const sorters = {
	parse: parseSorters,
	stringify: stringifySorters,
}
