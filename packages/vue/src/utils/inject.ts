import type { InjectionKey } from 'vue-demi'
import { inject } from 'vue-demi'

// eslint-disable-next-line ts/no-unsafe-function-type
const values = new WeakMap<Function, any>()

export function injectGetter<T>(
	key: InjectionGetterKey<T>,
): T | undefined {
	const value = inject(key, undefined)
	if (isGetter(value)) {
		if (!values.has(value)) {
			values.set(value, value())
		}

		return values.get(value)
	}

	return value
}

export type InjectionGetter<T> =
	| (() => T)
	| T

export type InjectionGetterKey<T> =
	InjectionKey<InjectionGetter<T>>

function isGetter(
	value: unknown,
): value is (() => any) {
	return value != null && typeof value === 'function'
}
