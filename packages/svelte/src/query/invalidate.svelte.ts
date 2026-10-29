import type { MaybeAccessor } from '../utils'
import type { UseQueryClientContextProps } from './query-client'
import { QueryInvalidate } from '@ginjou/core'
import { extract } from '../utils'
import { useQueryClientContext } from './query-client'

export type UseQueryInvalidateProps<
	TProps = undefined,
	TResult = undefined,
	TError = undefined,
> = MaybeAccessor<QueryInvalidate.Props<TProps, TResult, TError> | undefined>

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
	const resolvedProps = $derived(extract(props))

	return QueryInvalidate.createInvalidator<TProps, TResult, TError>({
		getFetcherName: () => resolvedProps?.fetcherName,
		getInvalidates: () => resolvedProps?.invalidates,
		getResource: () => resolvedProps?.resource,
		getId: () => resolvedProps?.id,
		getIds: () => resolvedProps?.ids,
		queryClient,
	})
}
