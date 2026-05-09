import type { Accessor } from '@tanstack/svelte-query'

export type MaybeAccessor<T> = T | Accessor<T>

export function extract<
	T,
>(
	value: MaybeAccessor<T>,
): T

export function extract<
	T,
>(
	value: MaybeAccessor<T | undefined>, defaultValue: T,
): T

export function extract<
	T,
>(
	value: unknown,
	defaultValue?: unknown,
): T {
	if ((typeof value) === 'function') {
		const getter = value
		const gotten = getter()
		if (gotten === undefined)
			return defaultValue as T
		return gotten
	}

	if (value === undefined)
		return defaultValue as T
	return value as T
}
