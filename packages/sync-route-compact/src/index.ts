import type { ConditionalFilter, Filter, Filters, Sorters } from '@ginjou/core'
import { FilterOperator } from '@ginjou/core'

function encodePart(value: string, encodeDot = false): string {
	const pattern = encodeDot ? /[.!'()*~]/g : /[!'()*~]/g
	return encodeURIComponent(value).replace(pattern, char =>
		`%${char.charCodeAt(0).toString(16).toUpperCase()}`)
}

function decodePart(value: string): string {
	return decodeURIComponent(value)
}

function stringifyValue(value: unknown): string {
	if (value === null)
		return 'z'

	switch (typeof value) {
		case 'string':
			return `s.${encodePart(value)}`
		case 'number':
			return `n.${value}`
		case 'boolean':
			return `b.${value ? 1 : 0}`
		case 'undefined':
			return 'u'
		default: {
			const json = JSON.stringify(value)
			if (json === undefined)
				return 'u'
			return `j.${encodePart(json)}`
		}
	}
}

function parseValue(value: string): unknown {
	if (value === 'z')
		return null
	if (value === 'u')
		return undefined
	if (value.startsWith('s.'))
		return decodePart(value.slice(2))
	if (value.startsWith('n.'))
		return Number(value.slice(2))
	if (value === 'b.1')
		return true
	if (value === 'b.0')
		return false
	if (value.startsWith('j.'))
		return JSON.parse(decodePart(value.slice(2)))

	throw new Error(`[@ginjou/sync-route-compact] Invalid filter value: ${value}`)
}

function parseConditionalSegment(segment: string): Pick<ConditionalFilter, 'operator' | 'key'> {
	const match = /^(or|and)(?:_\d+)?(?:@(.*))?$/.exec(segment)
	if (!match)
		throw new Error(`[@ginjou/sync-route-compact] Invalid filter path: ${segment}`)

	return {
		operator: match[1] as ConditionalFilter['operator'],
		...(match[2] === undefined ? {} : { key: decodePart(match[2]) }),
	}
}

function isConditionalFilter(filter: Filter): filter is ConditionalFilter {
	return filter.operator === FilterOperator.and || filter.operator === FilterOperator.or
}

export function stringifyFilters(value: Filters): string {
	const entries: string[] = []
	const visit = (siblings: Filters, path: string[]): void => {
		const counts = { and: 0, or: 0 }
		const indexes = { and: 0, or: 0 }

		for (const filter of siblings) {
			if (isConditionalFilter(filter))
				counts[filter.operator]++
		}

		for (const filter of siblings) {
			if (isConditionalFilter(filter)) {
				const index = indexes[filter.operator]++
				const segment = [
					filter.operator,
					counts[filter.operator] > 1 ? `_${index}` : '',
					filter.key === undefined ? '' : `@${encodePart(filter.key, true)}`,
				].join('')
				const conditionalPath = [...path, segment]

				if (filter.value.length === 0)
					entries.push(`${conditionalPath.join('.')}:`)
				else
					visit(filter.value, conditionalPath)
			}
			else {
				entries.push([
					[...path, encodePart(filter.field, true)].join('.'),
					filter.operator,
					stringifyValue(filter.value),
				].join(':'))
			}
		}
	}

	visit(value, [])
	return entries.join('~')
}

export function parseFilters(value: string): Filters {
	if (value === '')
		return []

	const result: Filters = []
	const conditionals = new Map<string, ConditionalFilter>()

	for (const entry of value.split('~')) {
		const parts = entry.split(':')
		const emptyConditional = parts.length === 2 && parts[1] === ''
		if (!emptyConditional && parts.length !== 3)
			throw new Error(`[@ginjou/sync-route-compact] Invalid filter: ${entry}`)

		const path = parts[0].split('.')
		const conditionalPath = emptyConditional ? path : path.slice(0, -1)
		let siblings = result
		let pathKey = ''

		for (const segment of conditionalPath) {
			pathKey = pathKey ? `${pathKey}.${segment}` : segment
			let conditional = conditionals.get(pathKey)
			if (!conditional) {
				conditional = {
					...parseConditionalSegment(segment),
					value: [],
				}
				conditionals.set(pathKey, conditional)
				siblings.push(conditional)
			}
			siblings = conditional.value
		}

		if (emptyConditional)
			continue

		const operator = parts[1]
		if (
			operator === FilterOperator.and
			|| operator === FilterOperator.or
			|| !Object.values(FilterOperator).includes(operator as Filter['operator'])
		) {
			throw new Error(`[@ginjou/sync-route-compact] Invalid filter operator: ${operator}`)
		}

		siblings.push({
			field: decodePart(path.at(-1)!),
			operator: operator as Exclude<Filter['operator'], 'or' | 'and'>,
			value: parseValue(parts[2]),
		})
	}

	return result
}

export function stringifySorters(value: Sorters): string {
	return value
		.map(sorter => `${encodePart(sorter.field)}:${sorter.order}`)
		.join('~')
}

export function parseSorters(value: string): Sorters {
	if (value === '')
		return []

	return value.split('~').map((sorter) => {
		const [field, order, extra] = sorter.split(':')
		if (extra !== undefined || (order !== 'asc' && order !== 'desc'))
			throw new Error(`[@ginjou/sync-route-compact] Invalid sorter: ${sorter}`)

		return {
			field: decodePart(field),
			order,
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
