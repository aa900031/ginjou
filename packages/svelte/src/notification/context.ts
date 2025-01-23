import type { Notification } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { getContext, setContext } from 'svelte'

const KEY = '$$_@ginjou/notification'

export function defineNotificationContext<
	T extends Notification,
>(
	value: T,
): T {
	setContext(KEY, value)
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
	const value = getContext<Notification>(KEY) ?? props?.notification
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
