import type { MaybeRef } from '@vueuse/shared'
import type { UnwrapRef } from 'vue-demi'
import { unref } from 'vue-demi'

export type UnwrapRefs<T extends Record<string, MaybeRef<any>>> = {
	[K in keyof T]: UnwrapRef<T[K]>
}

export function unrefs<T extends Record<string, MaybeRef<any>>>(
	value: T,
): UnwrapRefs<T> {
	const result = {} as UnwrapRefs<T>
	for (const key in value) {
		if (Object.prototype.hasOwnProperty.call(value, key))
			result[key] = unref(value[key])
	}

	return result
}

export function resolveGetter<T>(
	value: T | (() => T),
): T

export function resolveGetter(
	value: undefined,
): undefined

export function resolveGetter<T>(
	value: T | (() => T) | undefined,
): T | undefined {
	return typeof value === 'function'
		? (value as any)()
		: value
}
