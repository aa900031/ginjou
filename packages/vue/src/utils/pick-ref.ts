import type { MaybeRef } from '@vueuse/shared'
import type { Ref } from 'vue-demi'
import { unref } from 'vue-demi'
import { deriveRef } from './derive-ref'

export type PickRefGetter<T, TProp> = (
	props: { prop: TProp, prev?: T | undefined },
) => T | undefined

export function pickRef<T, TProp>(
	prop: MaybeRef<TProp>,
	get: PickRefGetter<T, TProp>,
): Ref<T | undefined> {
	return deriveRef(
		() => unref(prop),
		(value, prev) => get({
			prop: value,
			prev,
		}),
	)
}
