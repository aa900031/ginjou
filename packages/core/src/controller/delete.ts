import { NotificationType } from '../notification'
import type { Notification } from '../notification'
import type { I18n } from '../i18n'
import type { BaseRecord, DeleteMutationOptions } from '../query'
import type { CheckErrorMutationFn } from '../auth'

export interface CreateDeleteControllerSuccessHandlerProps {
	notification?: Notification
	i18n?: I18n
}

export function createDeleteControllerSuccessHandler<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams = Record<string, any>,
>(
	{
		notification,
		i18n,
	}: CreateDeleteControllerSuccessHandlerProps,
): NonNullable<DeleteMutationOptions<TData, TError, TParams>['onSuccess']> {
	return async function handleSuccess(_data, { resource, id }) {
		if (i18n?.translate && notification?.open) {
			notification.open({
				key: `${resource}-delete-${id}-notification`,
				message: i18n.translate('notifications.deleteSuccess'),
				description: i18n.translate('notifications.deleteSuccessDescription'),
				type: NotificationType.Success,
			})
		}
		// TODO: publish
		// TODO: audit log
		// TODO: redirect?
	}
}

export interface CreateDeleteControllerErrorHandlerProps {
	notification?: Notification
	i18n?: I18n
	checkError: CheckErrorMutationFn<unknown>
}

export function createDeleteControllerErrorHandler<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams = Record<string, any>,
>(
	{
		notification,
		i18n,
		checkError,
	}: CreateDeleteControllerErrorHandlerProps,
): NonNullable<DeleteMutationOptions<TData, TError, TParams>['onError']> {
	return async function handleError(err, { resource, id }) {
		await checkError(err)

		if (i18n?.translate && notification?.open) {
			notification.open({
				key: `${resource}-delete-${id}-notification`,
				message: i18n.translate('notifications.deleteError'),
				description: (err as Error | undefined)?.message,
				type: NotificationType.Error,
			})
		}
	}
}

// TODO: undoable
