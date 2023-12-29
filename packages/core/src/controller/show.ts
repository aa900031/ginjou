import type { CheckErrorMutationFn } from '../auth'
import type { I18n } from '../i18n'
import { type Notification, NotificationType } from '../notification'
import type { BaseRecord, GetOneProps, GetOneQueryOptions, GetOneResult } from '../query'

export interface GetShowRecordProps<
	TResultData extends BaseRecord,
> {
	result: GetOneResult<TResultData> | undefined
}

export function getShowRecord<
	TResultData extends BaseRecord,
>(
	props: GetShowRecordProps<TResultData>,
): TResultData | undefined {
	return props.result?.data
}

export interface CreateShowErrorHandlerProps {
	notification?: Notification
	i18n?: I18n
	getProps: () => GetOneProps
	checkError: CheckErrorMutationFn<unknown>
}

export function createShowErrorHandler<
	TData extends BaseRecord,
	TypeError = unknown,
	TResultData extends BaseRecord = TData,
>(
	{
		notification,
		i18n,
		getProps,
		checkError,
	}: CreateShowErrorHandlerProps,
): NonNullable<GetOneQueryOptions<TData, TypeError, TResultData>>['onError'] {
	return function handleError(err) {
		checkError(err)

		if (i18n?.translate && notification?.open) {
			const { id, resource } = getProps()

			notification.open({
				key: `${resource}-show-${id}-notification`,
				message: i18n.translate('notifications.showError'),
				description: (err as Error | undefined)?.message,
				type: NotificationType.Error,
			})
		}
	}
}
