import type { Notification, OpenNotificationParams } from './notification'

export type Fn = (
	params: OpenNotificationParams | false | undefined,
	fallback?: OpenNotificationParams,
) => void

export interface CreateFnProps {
	notification?: Notification
}

export function createFn(
	{
		notification,
	}: CreateFnProps,
): Fn {
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
