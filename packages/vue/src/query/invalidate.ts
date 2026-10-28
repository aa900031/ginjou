import type { Simplify } from 'type-fest'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseQueryClientContextProps } from './query-client'
import { QueryInvalidate } from '@ginjou/core'
import { unref } from 'vue-demi'
import { useQueryClientContext } from './query-client'

export type UseQueryInvalidateProps<
	TProps = unknown,
	TData = unknown,
> = Simplify<
	ToMaybeRefs<QueryInvalidate.Props<TProps, TData>>
>

export type UseQueryInvalidateContext = UseQueryClientContextProps

export function useQueryInvalidate<
	TProps = unknown,
	TData = unknown,
>(
	props?: UseQueryInvalidateProps<TProps, TData>,
	context?: UseQueryInvalidateContext,
): QueryInvalidate.Invalidator<TProps, TData> {
	const queryClient = useQueryClientContext(context)

	return QueryInvalidate.createInvalidator<TProps, TData>({
		getFetcherName: () => unref(props?.fetcherName),
		getInvalidates: () => unref(props?.invalidates),
		getResource: () => unref(props?.resource),
		getId: () => unref(props?.id),
		getIds: () => unref(props?.ids),
		queryClient,
	})
}
