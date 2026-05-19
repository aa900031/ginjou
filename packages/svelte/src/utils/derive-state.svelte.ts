import type { Box } from './box'
import { box } from './box'
import { watch } from './watch.svelte'

export function deriveState<T, TSource>(
	source: () => TSource,
	derive: (source: TSource, prev?: T | undefined) => T,
): Box<T> {
	let value = $state<T>(derive(source()))

	watch(source, (nextValue) => {
		value = derive(nextValue, value)
	})

	return box<T>({
		get: () => value,
		set: (nextValue: T) => {
			value = nextValue
		},
	})
}
