import { inject, provide } from 'vue-demi'
import type { Notification } from '@ginjou/core'

const KEY = Symbol('@ginjou/controller/notification')

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
