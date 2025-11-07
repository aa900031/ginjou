import { isEqual } from 'es-toolkit'
import { get } from 'es-toolkit/compat'

export function getSubValue<
	TProp,
	TResult,
>(
	{
		prop,
		path,
		prev,
		isValue,
	}: {
		prop: TProp | undefined
		path: string
		prev?: TResult
		isValue?: (prop: TProp) => boolean
	},
): TResult | undefined {
	let current: TResult | undefined

	if (prop == null) {
		current = undefined
	} else if (isValue?.(prop)) {
		current = prop as TResult // Assuming TProp can be TResult if isValue is true
	} else if (path === '') { // Explicitly handle empty path
		current = prop as TResult // If path is empty, the "sub-value" is the prop itself
	} else {
		current = get(prop, path)
	}

	return isEqual(current, prev)
		? prev
		: current
}
