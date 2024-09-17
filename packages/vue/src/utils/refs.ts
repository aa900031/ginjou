import type { MaybeRef } from '@vueuse/shared'
import type { OptionalKeysOf, RequiredKeysOf, Simplify } from 'type-fest'

export type ToMaybeRefs<
	T extends Record<any, any>,
> = T extends unknown
	? Simplify<
		& {
			[K in RequiredKeysOf<T>]: MaybeRef<T[K]>
		}
		& {
			[K in OptionalKeysOf<T>]?: MaybeRef<T[K] | undefined>
		}
	>
	: never
