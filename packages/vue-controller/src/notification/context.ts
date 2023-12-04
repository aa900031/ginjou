import { inject, provide } from 'vue-demi'
import type { Notification } from '@ginjou/controller'

const KEY = Symbol('__@ginjou/controller/notification__')

export function defineNotificationContext<
	T extends Notification,
>(value: T): T {
	provide(KEY, value)
	return value
}

export function useNotificationContext<
	T extends Notification = Notification,
>(): T | undefined {
	return inject(KEY, undefined)
}
