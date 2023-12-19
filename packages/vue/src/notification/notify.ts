import type { Simplify } from 'type-fest'
import type { NotificationOpenFn } from '@ginjou/core'
import type { UseNotificationContextFromProps } from './context'
import { useNotificationContext } from './context'

export type UseNotifyContext = Simplify<
	& UseNotificationContextFromProps
>

export function useNotify(
	context?: UseNotifyContext,
): NotificationOpenFn {
	const notification = useNotificationContext(context)

	return params => notification?.open(params)
}
