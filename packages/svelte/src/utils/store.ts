import type { Readable } from 'svelte/store'
import type { OptionalKeysOf, RequiredKeysOf, Simplify } from 'type-fest'
import { get, readable } from 'svelte/store'

export type MaybeReadable<T> =
	| T
	| Readable<T>

export type ToMaybeReadables<
	T extends Record<any, any>,
> = T extends unknown
	? Simplify<
		& {
			[K in RequiredKeysOf<T>]: MaybeReadable<T[K]>
		}
		& {
			[K in OptionalKeysOf<T>]?: MaybeReadable<T[K] | undefined>
		}
	>
	: never

export type ExecableFn<
	T extends Record<string, any> | undefined,
	TKey extends string,
> = T extends Record<string, any>
	? T[TKey] extends (...args: any[]) => any
		? T[TKey]
		: never
	: never

export function createExecableFn<
	T extends Record<string, any> | undefined,
	TKey extends string,
>(
	store: Readable<T>,
	key: TKey,
): ExecableFn<T, TKey> {
	return ((...args: any[]) => {
		const value = get(store)

		if (typeof value !== 'object' || value === null)
			throw new Error('Invalid store value')

		if (!(key in value) || value[key] == null || typeof value[key] !== 'function')
			throw new Error('Invalid store value')

		return value[key](...args)
	}) as unknown as ExecableFn<T, TKey>
}

export function toReadable<
	T,
>(
	value: MaybeReadable<T>,
): Readable<T> {
	if (isStore(value))
		return value
	return readable(value)
}

export function isStore<
	T,
>(
	value: MaybeReadable<T>,
): value is Readable<T> {
	return value != null
		&& typeof value === 'object'
		&& 'subscribe' in value
		&& typeof value.subscribe === 'function'
}

export function toGetter<
	T,
>(
	value: MaybeReadable<T>,
): (() => T) {
	return () => isStore(value)
		? get(value)
		: value
}
