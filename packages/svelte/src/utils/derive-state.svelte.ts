import { box } from './box'
import { watch } from './watch.svelte'

export function deriveState<T, TSource>(
	source: () => TSource,
	derive: (source: TSource, prev?: T | undefined) => T,
): {
	value: T
} {
	let value = $state<T>(derive(source()))

	watch(source, (nextValue) => {
		value = derive(nextValue, value)
	})

	return box({
		get: () => value,
		set: (nextValue) => {
			value = nextValue
		},
	})
}
