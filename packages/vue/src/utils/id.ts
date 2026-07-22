import type { App } from 'vue-demi'
import { injectLocal, provideLocal } from '@vueuse/shared'
import { isGreaterOrEqual } from 'verkit'
import { getCurrentInstance, useId, version } from 'vue-demi'

const KEY = Symbol('@ginjou/use-id')

type UseIdFn = () => string

export function defineUseId(
	fn: UseIdFn,
): UseIdFn {
	provideLocal(KEY, fn)
	return fn
}

export const useStableId: (
	prefix?: string,
) => string = isGreaterOrEqual(version, '3.5.0')
	? (
			prefix = 'ginjou',
		) => {
			let id: string

			const injected = injectLocal<UseIdFn | undefined>(KEY, undefined)
			if (injected) {
				id = injected()
			}
			else {
				id = useId()
			}
			return prefix ? `${prefix}-${id}` : id
		}
	: (
			prefix = 'ginjou',
		) => {
			let id: string

			const injected = injectLocal<UseIdFn | undefined>(KEY, undefined)
			if (injected) {
				id = injected()
			}
			else {
				id = useAppId()
			}

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
