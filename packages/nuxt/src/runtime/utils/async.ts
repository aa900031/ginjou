import { useNuxtApp } from '#imports'
import { getCurrentInstance, onServerPrefetch } from 'vue'

export type AsyncResult<
	T extends Record<string, unknown>,
>
	= & T
		& Promise<T>

export function withAsync<
	T extends Record<string, unknown>,
>(
	value: T,
	wait: () => Promise<void>,
): AsyncResult<T> {
	const nuxtApp = useNuxtApp()

	if (import.meta.server) {
		const instance = getCurrentInstance()

		const handler = async () => {
			await wait()
		}

		if (instance)
			onServerPrefetch(handler)
		else
			nuxtApp.hook('app:created', handler)
	}

	const promise = Promise.resolve(wait()).then(() => value)
	Object.assign(promise, value)

	return promise as unknown as AsyncResult<T>
}
