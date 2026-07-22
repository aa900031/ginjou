import type { DehydratedState, QueryClientConfig } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { App, InjectionKey } from 'vue-demi'
import { hydrate, QueryClient } from '@tanstack/vue-query'
import { injectLocal, provideLocal, tryOnBeforeMount, tryOnUnmounted } from '@vueuse/shared'
import { getCurrentInstance } from 'vue-demi'
import { useStableId } from '../utils/id'

interface AppState {
	queryClients: Map<string, QueryClient>
	dehydratedStates: Map<string, DehydratedState>
}

const KEY: InjectionKey<QueryClient> = Symbol('@ginjou/query-client')
const apps = new WeakMap<App, AppState>()

export function defineQueryClientContext(
	value?: QueryClientConfig | QueryClient,
): QueryClient {
	const instance = getCurrentInstance()
	if (!instance)
		throw new Error('defineQueryClientContext() is called when there is no active component')

	const key = useStableId()
	const state = getState(instance.appContext.app)
	value = createQueryClient(value)

	const dehydratedState = state.dehydratedStates.get(key)
	if (dehydratedState) {
		hydrate(value, dehydratedState)
		state.dehydratedStates.delete(key)
	}

	state.queryClients.set(key, value)

	provideLocal(KEY, value)
	provideLocal('VUE_QUERY_CLIENT', value)

	tryOnBeforeMount(() => value.mount(), true)
	tryOnUnmounted(() => {
		value.unmount()
		state.queryClients.delete(key)
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
		throw new Error('[@ginjou/vue] No queryClient context found. Use defineQueryClientContext() at app setup or pass queryClient through context props.')

	return value
}

export function getQueryClients(app: App): Map<string, QueryClient> {
	return new Map(apps.get(app)?.queryClients ?? [])
}

export function setQueryClientDehydrateState(
	app: App,
	key: string,
	value: DehydratedState,
): void {
	getState(app).dehydratedStates.set(key, value)
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

	throw new Error(`[@ginjou/vue] Unsupported query client context value: ${String(value)}`)
}

function getState(app: App): AppState {
	let state = apps.get(app)
	if (!state) {
		state = {
			queryClients: new Map(),
			dehydratedStates: new Map(),
		}
		apps.set(app, state)
	}

	return state
}
