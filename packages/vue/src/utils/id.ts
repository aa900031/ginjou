import type { App } from 'vue-demi'
import { injectLocal, provideLocal } from '@vueuse/shared'
import { isGreaterOrEqual } from 'verkit'
import { getCurrentInstance, useId, version } from 'vue-demi'

const KEY = Symbol('@ginjou/use-id')

type UseIdFn = () => string

const defaultUseId: UseIdFn = isGreaterOrEqual(version, '3.5.0') ? useId : useAppId

export function defineUseId(
	fn: UseIdFn,
): UseIdFn {
	provideLocal(KEY, fn)
	return fn
}

export function useStableId(
	prefix = 'ginjou',
): string {
	let id: string
	const injected = injectLocal<UseIdFn | undefined>(KEY, undefined)
	if (injected != null)
		id = injected()
	else
		id = defaultUseId()
	return prefix ? `${prefix}-${id}` : id
}

const AppIdCount = new WeakMap<App, number>()

function useAppId(): string {
	const instance = getCurrentInstance()
	if (!instance)
		throw new Error('useStableId() is called when there is no active component')

	let count = AppIdCount.get(instance.appContext.app) ?? 0
	++count
	AppIdCount.set(instance.appContext.app, count)
	return `v-fallback-${count}`
}
