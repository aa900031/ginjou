import type { Accessor } from '@tanstack/svelte-query'
import { untrack } from 'svelte'

export interface WatchOptions {
	flush?: 'pre' | 'post'
	immediate?: boolean
}

export function watch<T>(
	source: Accessor<T>,
	callback: (value: T, oldValue: T | undefined) => void | VoidFunction,
	options?: WatchOptions,
): (() => void) {
	const immediate = options?.immediate ?? false
	const flush = options?.flush ?? 'pre'

	let active = immediate
	let oldValue: T | undefined

	return runEffect(flush, () => {
		const value = source()
		if (!active) {
			active = true
			oldValue = value
			return
		}

		const cleanup = untrack(() => callback(value, oldValue))
		oldValue = value
		return cleanup
	})
}

function runEffect(
	flush: 'pre' | 'post',
	effect: () => void | VoidFunction,
): (() => void) {
	const cleanup = $effect.root(() => {
		switch (flush) {
			case 'post':
				$effect(effect)
				break
			case 'pre':
				$effect.pre(effect)
				break
		}
	})
	$effect(() => cleanup)

	return cleanup
}
