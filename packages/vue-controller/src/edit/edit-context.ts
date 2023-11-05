import { inject, provide } from 'vue-demi'
import type { UseEditResult } from './edit'

const KEY = Symbol('__@ginjou/controller/edit__')

export function defineEditContext<
	T extends UseEditResult<any, any, any>,
>(value: T): T {
	provide(KEY, value)
	return value
}

export function useEditContext<
	T extends UseEditResult = UseEditResult<any, any, any>,
>(): T | undefined {
	return inject(KEY, undefined)
}
