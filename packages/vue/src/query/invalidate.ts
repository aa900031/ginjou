import type { Simplify } from 'type-fest'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseQueryClientContextProps } from './query-client'
import { QueryInvalidate } from '@ginjou/core'
import { unref } from 'vue-demi'
import { useQueryClientContext } from './query-client'

export type UseQueryInvalidateProps<
	TProps = undefined,
	TResult = undefined,
	TError = undefined,
> = Simplify<
	ToMaybeRefs<QueryInvalidate.Props<TProps, TResult, TError>>
>

export type UseQueryInvalidateContext = UseQueryClientContextProps

export function useQueryInvalidate<
	TProps = undefined,
	TResult = undefined,
	TError = undefined,
>(
	props?: UseQueryInvalidateProps<TProps, TResult, TError>,
	context?: UseQueryInvalidateContext,
): QueryInvalidate.Invalidator<TProps, TResult, TError> {
	const queryClient = useQueryClientContext(context)

	return QueryInvalidate.createInvalidator<TProps, TResult, TError>({
		getFetcherName: () => unref(props?.fetcherName),
		getInvalidates: () => unref(props?.invalidates),
		getResource: () => unref(props?.resource),
		getId: () => unref(props?.id),
		getIds: () => unref(props?.ids),
		queryClient,
	})
}
