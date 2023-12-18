import type { QueryClient } from '@tanstack/vue-query'
import { useQueryClient } from '@tanstack/vue-query'

export interface UseQueryClientContextProps {
	queryClient?: QueryClient
}

export function useQueryClientContext(
	props?: UseQueryClientContextProps,
): QueryClient {
	return props?.queryClient ?? useQueryClient()
}
