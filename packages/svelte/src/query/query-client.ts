import type { DehydratedState, QueryClientConfig } from '@tanstack/svelte-query'
import type { Simplify } from 'type-fest'
import { hydrate, QueryClient, setQueryClientContext } from '@tanstack/svelte-query'
import { onDestroy, onMount } from 'svelte'
import { defineContext, requireContext, useContextValue } from '../utils'

const KEY = Symbol('@ginjou/query-client')
const queryClientMap = new Map<string, QueryClient>()
const dehydratedStateMap = new Map<string, DehydratedState>()

export function defineQueryClientContext(
	value?: QueryClientConfig | QueryClient,
	key = 'default',
): QueryClient {
	const queryClient = createQueryClient(value)
	const dehydratedState = dehydratedStateMap.get(key)

	if (dehydratedState) {
		hydrate(queryClient, dehydratedState)
		dehydratedStateMap.delete(key)
	}

	queryClientMap.set(key, queryClient)
	defineContext(KEY, queryClient)
	setQueryClientContext(queryClient)

	onMount(() => {
		queryClient.mount()
	})

	onDestroy(() => {
		queryClient.unmount()
		queryClientMap.delete(key)
	})

	return queryClient
}

export interface UseQueryClientContextFromProps {
	queryClient?: QueryClient
}

export type UseQueryClientContextProps = Simplify<
	& UseQueryClientContextFromProps
>

export function useQueryClientContext(
	props?: UseQueryClientContextProps,
): QueryClient {
	return requireContext(useContextValue(KEY, props?.queryClient), 'queryClient')
}

export function getQueryClients(): Map<string, QueryClient> {
	return new Map([...queryClientMap])
}

export function setQueryClientDehydrateState(
	key: string,
	value: DehydratedState,
): void {
	dehydratedStateMap.set(key, value)
}

function createQueryClient(
	value: QueryClient | QueryClientConfig | undefined,
): QueryClient {
	if (value == null)
		return new QueryClient()

	if (value instanceof QueryClient)
		return value

	return new QueryClient(value)
}
