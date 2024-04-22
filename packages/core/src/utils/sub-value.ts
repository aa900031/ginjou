import { get, isEqual } from 'lodash-unified'

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
	const current = prop == null
		? undefined
		: isValue?.(prop)
			? prop
			: get(prop, path)

	return isEqual(current, prev)
		? prev
		: current
}
