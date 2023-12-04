import type { Notification } from '@ginjou/controller'
import { defaultNotificationOpen } from '@ginjou/controller'
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
