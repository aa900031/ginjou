import { NotificationType } from '../notification'
import type { Notification } from '../notification'
import type { BaseRecord, CreateMutationOptions } from '../query'
import type { CheckErrorMutationFn } from '../auth'
import type { I18n } from '../i18n'

export interface CreateCreateControllerSuccessHandlerProps {
	notification?: Notification
	i18n?: I18n
}

export function createCreateControllerSuccessHandler<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams = Record<string, any>,
>(
	{
		notification,
		i18n,
	}: CreateCreateControllerSuccessHandlerProps,
): NonNullable<CreateMutationOptions<TData, TError, TParams>['onSuccess']> {
	return async function handleSuccess(_data, { resource }) {
		if (i18n?.translate && notification?.open) {
			notification.open({
				key: `create-${resource}-notification`,
				message: i18n.translate('notifications.createSuccess'),
				description: i18n.translate('notifications.success'),
				type: NotificationType.Success,
			})
		}
		// TODO: publish
		// TODO: audit log
		// TODO: redirect?
	}
}

export interface CreateCreateControllerErrorHandlerProps {
	notification?: Notification
	i18n?: I18n
	checkError?: CheckErrorMutationFn<unknown>
}

export function createCreateControllerErrorHandler<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams = Record<string, any>,
>(
	{
		i18n,
		notification,
		checkError,
	}: CreateCreateControllerErrorHandlerProps,
): NonNullable<CreateMutationOptions<TData, TError, TParams>['onError']> {
	return async function handleError(err, { resource }) {
		await checkError?.(err)

		if (i18n?.translate && notification?.open) {
			notification.open({
				key: `create-${resource}-notification`,
				message: i18n.translate('notifications.createError'),
				description: (err as Error | undefined)?.message,
				type: NotificationType.Error,
			})
		}
	}
}
