import { inject, provide } from 'vue-demi'
import type { Router } from '@ginjou/controller'

const KEY = Symbol('__@ginjou/controller/router__')

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
