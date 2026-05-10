import type { Simplify } from 'type-fest'
import type { UseNotificationContextFromProps } from './context'
import { Notify } from '@ginjou/core'
import { useNotificationContext } from './context'

export type UseNotifyContext = Simplify<
	& UseNotificationContextFromProps
>

export function useNotify(
	context?: UseNotifyContext,
): Notify.Fn {
	const notification = useNotificationContext(context)

	return Notify.createFn({
		notification,
	})
}
