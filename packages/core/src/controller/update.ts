import type { CheckErrorMutationFn } from '../auth'
import type { I18n } from '../i18n'
import { type Notification, NotificationType } from '../notification'
import type { BaseRecord, UpdateMutationOptions } from '../query'

export interface CreateUpdateControllerSuccessHandlerProps {
	i18n?: I18n
	notification?: Notification
}

export function createUpdateControllerSuccessHandler<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = Record<string, any>,
>(
	{
		i18n,
		notification,
	}: CreateUpdateControllerSuccessHandlerProps,
): NonNullable<UpdateMutationOptions<TData, TError, TParams>['onSuccess']> {
	return async function handleSuccess(_data, { resource, id }) {
		if (i18n?.translate && notification?.open) {
			notification.open({
				key: `update-${resource}-${id}-notification`,
				message: i18n.translate('notifications.updateSuccess'),
				description: i18n.translate('notifications.success'),
				type: NotificationType.Success,
			})
		}
		// TODO: publish
		// TODO: audit log
		// TODO: redirect?
	}
}

export interface CreateUpdateControllerErrorHandlerProps {
	i18n?: I18n
	notification?: Notification
	checkError?: CheckErrorMutationFn<unknown>
}

export function createUpdateControllerErrorHandler<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = Record<string, any>,
>(
	{
		i18n,
		notification,
		checkError,
	}: CreateUpdateControllerErrorHandlerProps,
): NonNullable<UpdateMutationOptions<TData, TError, TParams>['onError']> {
	return async function handleError(err, { resource, id }) {
		await checkError?.(err)

		if (i18n?.translate && notification?.open) {
			notification.open({
				key: `update-${resource}-${id}-notification`,
				message: i18n.translate('notifications.editError'),
				description: (err as Error | undefined)?.message,
				type: NotificationType.Error,
			})
		}
	}
}
