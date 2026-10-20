import type { MaybeAccessor } from '../utils'
import type { UseQueryClientContextProps } from './query-client'
import { QueryInvalidate } from '@ginjou/core'
import { extract } from '../utils'
import { useQueryClientContext } from './query-client'

export type UseQueryInvalidateProps<
	TProps = QueryInvalidate.BaseProps,
	TData = unknown,
> = MaybeAccessor<QueryInvalidate.Props<TProps, TData> | undefined>

export type UseQueryInvalidateContext = UseQueryClientContextProps

export function useQueryInvalidate<
	TProps = QueryInvalidate.BaseProps,
	TData = unknown,
>(
	props?: UseQueryInvalidateProps<TProps, TData>,
	context?: UseQueryInvalidateContext,
): QueryInvalidate.Invalidator<TProps, TData> {
	const queryClient = useQueryClientContext(context)
	const resolvedProps = $derived(extract(props))

	return QueryInvalidate.createInvalidator<TProps, TData>({
		getFetcherName: () => resolvedProps?.fetcherName,
		getInvalidates: () => resolvedProps?.invalidates,
		getResource: () => resolvedProps?.resource,
		queryClient,
	})
}
