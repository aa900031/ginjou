import type { BaseRecord, CustomMutationOptions } from '../query'
import type { CheckErrorMutationFn } from '../auth'
import type { I18n, TranslateFn } from '../i18n'
import type { Notification, NotifyFn } from '../notification'

export interface CreateCustomMutationControllerSuccessHandlerProps {
	notify: NotifyFn
	translate: TranslateFn<unknown>
}

export function createCustomMutationControllerSuccessHandler<
	TData extends BaseRecord = BaseRecord,
	TQuery = unknown,
	TPayload = unknown,
	TError = unknown,
>(
	_props: CreateCustomMutationControllerSuccessHandlerProps,
): NonNullable<CustomMutationOptions<TData, TQuery, TPayload, TError>>['onSuccess'] {
	return async function handleSuccess() {
		// TODO: notify by props
	}
}

export interface CreateCustomMutationControllerErrorHandlerProps {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	checkError: CheckErrorMutationFn<unknown>
}

export function createCustomMutationControllerErrorHandler<
	TData extends BaseRecord = BaseRecord,
	TQuery = unknown,
	TPayload = unknown,
	TError = unknown,
>(
	{
		checkError,
	}: CreateCustomMutationControllerErrorHandlerProps,
): NonNullable<CustomMutationOptions<TData, TQuery, TPayload, TError>>['onError'] {
	return async function handleError(err) {
		await checkError(err)
		// TODO: notify by props
	}
}
