import type { UseQueryOptions } from '@tanstack/vue-query'
import type { ComputedRef, MaybeRef } from 'vue-demi'
import { computed, unref } from 'vue-demi'

export function toEnabledRef(
	defaultValue?: () => boolean,
	queryOptions?: MaybeRef<UseQueryOptions<any, any, any> | undefined>,
): ComputedRef<boolean | undefined> {
	return computed(() => {
		let enabledByQueryOptions: boolean | undefined
		const optionsEnabled = unref(unref(queryOptions)?.enabled)
		if (typeof optionsEnabled === 'function')
			enabledByQueryOptions = optionsEnabled()
		else
			enabledByQueryOptions = optionsEnabled

		return enabledByQueryOptions ?? defaultValue?.()
	})
}
