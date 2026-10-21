import type { Simplify } from 'type-fest'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseQueryClientContextProps } from './query-client'
import { QueryInvalidate } from '@ginjou/core'
import { unref } from 'vue-demi'
import { useQueryClientContext } from './query-client'

export type UseQueryInvalidateProps<
	TData = unknown,
> = Simplify<
	ToMaybeRefs<QueryInvalidate.Props<TData>>
>

export type UseQueryInvalidateContext = UseQueryClientContextProps

export function useQueryInvalidate<
	TData = unknown,
>(
	props?: UseQueryInvalidateProps<TData>,
	context?: UseQueryInvalidateContext,
): QueryInvalidate.Invalidator<TData> {
	const queryClient = useQueryClientContext(context)

	return QueryInvalidate.createInvalidator<TData>({
		getFetcherName: () => unref(props?.fetcherName),
		getInvalidates: () => unref(props?.invalidates),
		getResource: () => unref(props?.resource),
		queryClient,
	})
}
