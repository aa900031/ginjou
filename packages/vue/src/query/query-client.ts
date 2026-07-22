import type { DehydratedState, QueryClientConfig } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { App, InjectionKey } from 'vue-demi'
import { hydrate, QueryClient } from '@tanstack/vue-query'
import { injectLocal, provideLocal, tryOnBeforeMount, tryOnUnmounted } from '@vueuse/shared'
import { getCurrentInstance } from 'vue-demi'
import { useStableId } from '../utils/id'

interface AppState {
	queryClient: QueryClient | undefined
	dehydratedState: DehydratedState | undefined
}

const KEY: InjectionKey<QueryClient> = Symbol('@ginjou/query-client')
const apps = new WeakMap<App, Map<string, AppState>>()

export function defineQueryClientContext(
	value?: QueryClientConfig | QueryClient,
): QueryClient {
	const instance = getCurrentInstance()
	if (!instance)
		throw new Error('defineQueryClientContext() is called when there is no active component')

	const key = useStableId()
	const state = getState(instance.appContext.app, key)
	value = createQueryClient(value)

	const dehydratedState = state.dehydratedState
	if (dehydratedState) {
		hydrate(value, dehydratedState)
		state.dehydratedState = undefined
	}

	state.queryClient = value

	provideLocal(KEY, value)
	provideLocal('VUE_QUERY_CLIENT', value)

	tryOnBeforeMount(() => value.mount(), true)
	tryOnUnmounted(() => {
		value.unmount()
		apps.get(instance.appContext.app)?.delete(key)
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
	const states = apps.get(app)
	const result = new Map<string, QueryClient>()
	if (!states)
		return result
	for (const [key, value] of states) {
		if (value.queryClient)
			result.set(key, value.queryClient)
	}
	return result
}

export function setQueryClientDehydrateState(
	app: App,
	key: string,
	value: DehydratedState,
): void {
	const state = getState(app, key)
	state.dehydratedState = value
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

function getState(
	vueApp: App,
	key: string,
): AppState {
	let states = apps.get(vueApp)
	if (!states) {
		states = new Map()
		apps.set(vueApp, states)
	}

	let state = states.get(key)
	if (!state) {
		state = {
			queryClient: undefined,
			dehydratedState: undefined,
		}
		states.set(key, state)
	}

	return state
}
