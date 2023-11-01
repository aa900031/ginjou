import type { UseQueryOptions } from '@tanstack/vue-query'
import type { ComputedRef } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import type { MaybeRef, MaybeRefOrGetter } from '@vueuse/shared'
import { toValue } from '@vueuse/shared'

export function toEnabledRef(
	defaultValue?: MaybeRefOrGetter<boolean | undefined>,
	queryOptions?: MaybeRef<UseQueryOptions<any, any, any> | undefined>,
): ComputedRef<boolean | undefined> {
	return computed(() => {
		let enabledByQueryOptions: boolean | undefined
		const optionsEnabled = unref(unref(queryOptions)?.enabled)
		if (typeof optionsEnabled === 'function')
			enabledByQueryOptions = optionsEnabled()
		else
			enabledByQueryOptions = optionsEnabled

		return enabledByQueryOptions ?? toValue(defaultValue)
	})
}
