import { watch } from './watch.svelte'

export function stateFallback<T, TParams>(
	params: () => TParams,
	get: (params: TParams, old?: T | undefined) => T,
): {
	value: T
} {
	let value = $state<T>(get(params()))

	watch(params, (val) => {
		value = get(val, value)
	})

	return {
		get value() {
			return value
		},
		set value(nextValue) {
			value = nextValue
		},
	}
}
