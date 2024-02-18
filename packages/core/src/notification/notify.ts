import type { Notification, OpenNotificationParams } from './notification'

export type NotifyFn = (
	params: OpenNotificationParams | false | undefined,
	fallback?: OpenNotificationParams,
) => void

export interface CreateNotifyFnProps {
	notification?: Notification
}

export function createNotifyFn(
	{
		notification,
	}: CreateNotifyFnProps,
): NotifyFn {
	return function notify(
		params,
		fallback,
	) {
		if (!notification)
			return

		if (params === false)
			return

		const _params = params ?? fallback
		if (!_params)
			return

		notification.open(_params)
	}
}
