import type { MaybeAccessor } from '../utils'
import type { UseQueryClientContextProps } from './query-client'
import { QueryInvalidate } from '@ginjou/core'
import { extract } from '../utils'
import { useQueryClientContext } from './query-client'

export type UseQueryInvalidateProps = MaybeAccessor<QueryInvalidate.Props | undefined>

export type UseQueryInvalidateContext = UseQueryClientContextProps

export function useQueryInvalidate(
	props?: UseQueryInvalidateProps,
	context?: UseQueryInvalidateContext,
): QueryInvalidate.Invalidator {
	const queryClient = useQueryClientContext(context)

	return QueryInvalidate.createInvalidator({
		getFetcherName: () => extract(props)?.fetcherName,
		getInvalidates: () => extract(props)?.invalidates,
		getResource: () => extract(props)?.resource,
		queryClient,
	})
}
