import { inject, provide } from 'vue-demi'
import type { UseListResult } from './list'

const KEY = Symbol('@ginjou/controller/list')

export function defineListContext<
	T extends UseListResult<any, any, any>,
>(value: T): T {
	provide(KEY, value)
	return value
}

export function useListContext<
	T extends UseListResult = UseListResult<any, any, any>,
>(): T | undefined {
	return inject(KEY, undefined)
}
