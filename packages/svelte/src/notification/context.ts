import type { Notification } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { defineContext, requireContext, useContextValue } from '../utils'

const KEY = Symbol('@ginjou/notification')

export function defineNotificationContext<T extends Notification>(value: T): T {
	return defineContext(KEY, value)
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
	const value = useContextValue(KEY, props?.notification)

	if (props?.strict === true)
		return requireContext(value, 'notification')

	return value
}
