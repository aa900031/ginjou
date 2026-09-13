import type { UseQueryClientContextProps } from './query-client'
import { QueryInvalidate } from '@ginjou/core'
import { useQueryClientContext } from './query-client'

export type UseQueryInvalidateContext = UseQueryClientContextProps

export function useQueryInvalidate(
	context?: UseQueryInvalidateContext,
): QueryInvalidate.Fn {
	const queryClient = useQueryClientContext(context)
	return QueryInvalidate.createFn({ queryClient })
}
