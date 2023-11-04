import { inject, provide } from 'vue-demi'
import type { UseShowResult } from './show'

const KEY = Symbol('__@ginjou/controller/show__')

export function defineShowContext<
	T extends UseShowResult<any, any, any>,
>(value: T): T {
	provide(KEY, value)
	return value
}

export function useShowContext<
	T extends UseShowResult = UseShowResult<any, any, any>,
>(): T | undefined {
	return inject(KEY, undefined)
}
