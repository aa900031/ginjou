import type { InvalidateFn } from '@ginjou/core'
import type { UseQueryClientContextProps } from './query-client'
import { invalidate } from '@ginjou/core'
import { useQueryClientContext } from './query-client'

export type UseInvalidateContext = UseQueryClientContextProps

export function useInvalidate(
	context?: UseInvalidateContext,
): InvalidateFn {
	const queryClient = useQueryClientContext(context)
	return props => invalidate(props, queryClient)
}
