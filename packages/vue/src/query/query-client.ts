import type { DehydratedState, QueryClientConfig } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { InjectionKey } from 'vue-demi'
import { hydrate, QueryClient } from '@tanstack/vue-query'
import { injectLocal, provideLocal, tryOnBeforeMount, tryOnUnmounted } from '@vueuse/shared'

const KEY: InjectionKey<QueryClient> = Symbol('@ginjou/query-client')
const queryClientMap = new Map<string, QueryClient>()
const dehydratedStateMap = new Map<string, DehydratedState>()

export function defineQueryClientContext(
	value?: QueryClientConfig | QueryClient,
	key = 'default',
) {
	value = createQueryClient(value)

	const dehydratedState = dehydratedStateMap.get(key)
	if (dehydratedState) {
		hydrate(value, dehydratedState)
		dehydratedStateMap.delete(key)
	}

	queryClientMap.set(key, value)

	provideLocal(KEY, value)
	provideLocal('VUE_QUERY_CLIENT', value)

	tryOnBeforeMount(() => value.mount(), true)
	tryOnUnmounted(() => {
		value.unmount()
		queryClientMap.delete(key)
	})

	return value
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
	if (props?.queryClient != null)
		return props.queryClient

	const value = injectLocal(KEY, undefined)
	if (value == null)
		throw new Error('No \'queryClient\' found in context, use \'defineQueryClientContext\' to properly initialize the library.')

	return value
}

export function getQueryClients(): Map<string, QueryClient> {
	return new Map([...queryClientMap])
}

export function setQueryClientDehydrateState(
	key: string,
	value: DehydratedState,
) {
	dehydratedStateMap.set(key, value)
}

function createQueryClient(
	value: QueryClient | QueryClientConfig | undefined,
): QueryClient {
	if (value == null)
		return new QueryClient()
	if (value instanceof QueryClient)
		return value
	if (typeof value === 'object')
		return new QueryClient(value)

	throw new Error('Not support value:', value)
}
