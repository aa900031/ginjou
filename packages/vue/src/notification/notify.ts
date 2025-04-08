import type { NotifyFn } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseNotificationContextFromProps } from './context'
import { createNotifyFn } from '@ginjou/core'
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
