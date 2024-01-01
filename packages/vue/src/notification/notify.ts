import type { Simplify } from 'type-fest'
import { type NotifyFn, createNotifyFn } from '@ginjou/core'
import type { UseNotificationContextFromProps } from './context'
import { useNotificationContext } from './context'

export type UseNotifyContext = Simplify<
	& UseNotificationContextFromProps
>

export function useNotify(
	context?: UseNotifyContext,
): NotifyFn {
	const notification = useNotificationContext(context)

	return createNotifyFn({
		notification,
	})
}
