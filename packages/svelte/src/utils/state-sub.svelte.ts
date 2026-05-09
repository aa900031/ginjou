import { watch } from './watch.svelte'

export function stateSub<T, TProp>(
	prop: () => TProp,
	get: (params: { prop: TProp, prev?: T | undefined }) => T | undefined,
): {
	value: T | undefined
} {
	let value = $state<T | undefined>(get({ prop: prop() }))

	watch(prop, (val) => {
		value = get({
			prop: val,
			prev: value,
		})
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
