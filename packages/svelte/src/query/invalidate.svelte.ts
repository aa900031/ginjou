import type { MaybeAccessor } from '../utils'
import type { UseQueryClientContextProps } from './query-client'
import { QueryInvalidate } from '@ginjou/core'
import { extract } from '../utils'
import { useQueryClientContext } from './query-client'

export type UseQueryInvalidateProps<
	TData = unknown,
> = MaybeAccessor<QueryInvalidate.Props<TData> | undefined>

export type UseQueryInvalidateContext = UseQueryClientContextProps

export function useQueryInvalidate<
	TData = unknown,
>(
	props?: UseQueryInvalidateProps<TData>,
	context?: UseQueryInvalidateContext,
): QueryInvalidate.Invalidator<TData> {
	const queryClient = useQueryClientContext(context)
	const resolvedProps = $derived(extract(props))

	return QueryInvalidate.createInvalidator<TData>({
		getFetcherName: () => resolvedProps?.fetcherName,
		getInvalidates: () => resolvedProps?.invalidates,
		getResource: () => resolvedProps?.resource,
		queryClient,
	})
}
