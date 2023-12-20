import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import { getResourceFetcherName } from '@ginjou/core'
import type { UseResourceContext } from './resource'
import { useResource } from './resource'

export interface UseResourceFetcherNameProps {
	name?: MaybeRef<string | undefined>
}

export type UseResourceFetcherNameContext = Simplify<
	& UseResourceContext
>

export function useResourceFetcherName(
	props?: UseResourceFetcherNameProps,
	context?: UseResourceFetcherNameContext,
) {
	const resource = useResource(props, context)
	return computed(() => getResourceFetcherName(unref(resource)))
}
