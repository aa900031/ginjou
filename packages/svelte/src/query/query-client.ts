import type { QueryClient } from '@tanstack/svelte-query'
import { useQueryClient } from '@tanstack/svelte-query'

export interface UseQueryClientContextProps {
	queryClient?: QueryClient
}

export function useQueryClientContext(
	props?: UseQueryClientContextProps,
): QueryClient {
	return props?.queryClient ?? useQueryClient()
}
