import type { Filters, Sorters } from '../query'

export interface Options {
	currentPage?:
		| boolean
		| {
			field?: string
		}
	perPage?:
		| boolean
		| {
			field?: string
		}
	filters?:
		| boolean
		| {
			field?: string
			parse?: (value: string) => Filters
			stringify?: (value: Filters) => string
		}
	sorters?:
		| boolean
		| {
			field?: string
			parse?: (value: string) => Sorters
			stringify?: (value: Sorters) => string
		}
}

export type Prop
	= | boolean
		| Options

export const DEFAULT = false

export function resolve(
	controller: { syncRoute?: Prop } | undefined,
	value: Prop | undefined,
): Prop {
	return value ?? controller?.syncRoute ?? DEFAULT
}
