import { FilterOperator } from '@ginjou/core'
import type { FilterOperatorType, Filters } from '@ginjou/core'

export function genFilters(
	filters?: Filters,
): Record<string, string> | undefined {
	if (!filters || !filters.length)
		return

	const result: Record<string, string> = {}
	filters.forEach((filter) => {
		switch (filter.operator) {
			case FilterOperator.or:
			case FilterOperator.and:
				throw new Error(
					`[@ginjou/with-rest-api]: \`operator: ${filter.operator}\` is not supported.`,
				)
		}

		if ('field' in filter) {
			const { field, operator, value } = filter

			if (field === 'q') {
				result[field] = value
				return
			}

			const mappedOperator = getOperator(operator)
			result[`${field}${mappedOperator}`] = value
		}
	})

	return result
}

function getOperator(
	operator: FilterOperatorType,
) {
	switch (operator) {
		case FilterOperator.ne:
		case FilterOperator.gte:
		case FilterOperator.lte:
			return `_${operator}`
		case FilterOperator.contains:
			return '_like'
		case FilterOperator.eq:
		default:
			return ''
	}
}
