import type { MaybeRef } from '@vueuse/shared'
import type { Ref } from 'vue-demi'
import { shallowRef, unref, watch } from 'vue-demi'

export type RefSubGetter<T, TProp> = (
	props: { prop: TProp; prev?: T | undefined }
) => T | undefined

export function refSub<T, TProp>(
	prop: MaybeRef<TProp>,
	get: RefSubGetter<T, TProp>,
): Ref<T | undefined> {
	const result = shallowRef<T | undefined>(get({ prop: unref(prop) }))

	watch(() => unref(prop), (val) => {
		result.value = get({
			prop: val,
			prev: unref(result),
		})
	}, { flush: 'sync' })

	return result
}
