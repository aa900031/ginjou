import type { Simplify } from 'type-fest'
import { inject, provide } from 'vue-demi'
import type { Notification } from '@ginjou/core'

const KEY = Symbol('@ginjou/notification')

export function defineNotificationContext<
	T extends Notification,
>(value: T): T {
	provide(KEY, value)
	return value
}

export interface UseNotificationContextFromProps {
	notification?: Notification
}

export type UseNotificationContextProps = Simplify<
	& UseNotificationContextFromProps
	& {
		strict?: boolean
	}
>

export function useNotificationContext(
	props: UseNotificationContextProps & { strict: true },
): Notification

export function useNotificationContext(
	props?: UseNotificationContextProps,
): Notification | undefined

export function useNotificationContext(
	props?: UseNotificationContextProps,
): Notification | undefined {
	const value = inject(KEY, undefined) ?? props?.notification
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
