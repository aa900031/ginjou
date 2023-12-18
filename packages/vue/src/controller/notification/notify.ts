import type { Notification } from '@ginjou/core'
import { defaultNotificationOpen } from '@ginjou/core'
import { useNotificationContext } from './context'

export interface UseNotifyContext {
	notification?: Notification
}

export function useNotify(
	context?: UseNotifyContext,
) {
	const notification = useNotificationContext() ?? context?.notification
	return notification?.open ?? defaultNotificationOpen
}
