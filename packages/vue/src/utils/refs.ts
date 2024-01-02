import type { MaybeRef } from '@vueuse/shared'
import type { OptionalKeysOf, RequiredKeysOf } from 'type-fest'

export type ToMaybeRefs<
	T extends Record<any, any>,
> =
	& {
		[K in RequiredKeysOf<T>]: MaybeRef<T[K]>
	}
	& {
		[K in OptionalKeysOf<T>]?: MaybeRef<T[K] | undefined>
	}
