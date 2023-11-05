import { inject, provide } from 'vue-demi'
import type { UseCreateResult } from './create'

const KEY = Symbol('__@ginjou/controller/create__')

export function defineCreateContext<
	T extends UseCreateResult<any, any, any>,
>(value: T): T {
	provide(KEY, value)
	return value
}

export function useCreateContext<
	T extends UseCreateResult = UseCreateResult<any, any, any>,
>(): T | undefined {
	return inject(KEY, undefined)
}
