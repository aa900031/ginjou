import type { CustomProps } from '../../query'
import type { CheckErrorMutationFn } from '../auth'
import type { I18n } from '../i18n'
import { type Notification, NotificationType } from '../notification'

export interface CreateCustomControllerSuccessHandlerProps<
	TQuery,
	TPayload,
> {
	notification?: Notification
	i18n?: I18n
	getProps: () => CustomProps<TQuery, TPayload>
}

export function createCustomControllerSuccessHandler() {
	return function handleSuccess() {

	}
}

export interface CreateCustomControllerErrorHandlerProps<
	TQuery,
	TPayload,
> {
	notification?: Notification
	i18n?: I18n
	getProps: () => CustomProps<TQuery, TPayload>
	checkError: CheckErrorMutationFn<unknown>
}

export function createCustomControllerErrorHandler<
	TQuery,
	TPayload,
>(): NonNullable<Cius<TData, TypeError, TResultData>>['onError'] {
	return function handleError(err) {
		checkError(err)
	}
}
