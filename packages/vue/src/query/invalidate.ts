import type { ToMaybeRefs } from '@bouzu/vue-helper'
import type { Simplify } from 'type-fest'
import type { UseQueryClientContextProps } from './query-client'
import { QueryInvalidate } from '@ginjou/core'
import { unref } from 'vue-demi'
import { useQueryClientContext } from './query-client'

export type UseQueryInvalidateProps = Simplify<
	ToMaybeRefs<QueryInvalidate.Props>
>

export type UseQueryInvalidateContext = UseQueryClientContextProps

export function useQueryInvalidate(
	props?: UseQueryInvalidateProps,
	context?: UseQueryInvalidateContext,
): QueryInvalidate.Invalidator {
	const queryClient = useQueryClientContext(context)

	return QueryInvalidate.createInvalidator({
		getFetcherName: () => unref(props?.fetcherName),
		getInvalidates: () => unref(props?.invalidates),
		getResource: () => unref(props?.resource),
		queryClient,
	})
}
