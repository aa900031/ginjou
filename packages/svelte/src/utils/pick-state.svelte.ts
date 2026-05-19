import { deriveState } from './derive-state.svelte'

export type PickStateGetter<T, TProp> = (
	params: { prop: TProp, prev?: T | undefined },
) => T | undefined

export function pickState<T, TProp>(
	prop: () => TProp,
	get: PickStateGetter<T, TProp>,
): {
	value: T | undefined
} {
	return deriveState(
		prop,
		(value, prev) => get({
			prop: value,
			prev,
		}),
	)
}
