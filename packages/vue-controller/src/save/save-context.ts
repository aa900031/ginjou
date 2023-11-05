import { inject, provide } from 'vue-demi'
import type { Save } from './save'

const KEY = Symbol('__@ginjou/controller/save__')

export function defineSaveContext<
	T extends Save,
>(value: T): T {
	provide(KEY, value)
	return value
}

export function useSaveContext<
	T extends Save = Save,
>(): T | undefined {
	return inject(KEY, undefined)
}
