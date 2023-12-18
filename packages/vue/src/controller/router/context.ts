import { inject, provide } from 'vue-demi'
import type { Router } from '@ginjou/core'

const KEY = Symbol('@ginjou/controller/router')

export function defineRouterContext<
	T extends Router,
>(value: T): T {
	provide(KEY, value)
	return value
}

export function useRouterContext<
	T extends Router = Router,
>(): T | undefined {
	return inject(KEY, undefined)
}
