import type { BaseRecord, CustomProps, CustomQueryOptions } from '../query'
import type { CheckErrorMutationFn } from '../auth'
import type { I18n } from '../i18n'
import type { Notification } from '../notification'

export interface CreateCustomControllerSuccessHandlerProps<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
	TResultData extends BaseRecord,
> {
	notification?: Notification
	i18n?: I18n
	getProps: () => CustomProps<TQuery, TPayload>
	onSuccess?: CustomQueryOptions<TData, TError, TResultData>['onSuccess']
}

export function createCustomControllerSuccessHandler<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TQuery = unknown,
	TPayload = unknown,
	TResultData extends BaseRecord = TData,
>(
	{
		// notification,
		// i18n,
		// getProps,
		onSuccess,
	}: CreateCustomControllerSuccessHandlerProps<TData, TError, TQuery, TPayload, TResultData>,
): NonNullable<CustomQueryOptions<TData, TError, TResultData>>['onSuccess'] {
	return function handleSuccess(data) {
		onSuccess?.(data)

		// TODO: notify by props
	}
}

export interface CreateCustomControllerErrorHandlerProps<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
	TResultData extends BaseRecord,
> {
	notification?: Notification
	i18n?: I18n
	getProps: () => CustomProps<TQuery, TPayload>
	checkError: CheckErrorMutationFn<unknown>
	onError?: CustomQueryOptions<TData, TError, TResultData>['onError']
}

export function createCustomControllerErrorHandler<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TQuery = unknown,
	TPayload = unknown,
	TResultData extends BaseRecord = TData,
>(
	{
		// notification,
		// i18n,
		// getProps,
		checkError,
		onError,
	}: CreateCustomControllerErrorHandlerProps<TData, TError, TQuery, TPayload, TResultData>,
): NonNullable<CustomQueryOptions<TData, TError, TResultData>>['onError'] {
	return function handleError(err) {
		checkError(err)
		onError?.(err)

		// TODO: notify by props
	}
}
