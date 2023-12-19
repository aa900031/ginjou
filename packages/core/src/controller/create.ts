import type { Router, RouterGoParams } from '../router'
import type { BaseRecord, CreateMutateFn, CreateMutationProps, CreateResult } from '../query'
import { type NotificationOpenFn, NotificationType } from '../notification'
import { type SaveFunction, toMutateOptions } from './save'
import { getErrorMessage } from './error'

export interface CreateSaveCreateFnProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams = Record<string, any>,
	TMutateFn extends CreateMutateFn<TData, TError, TParams> = CreateMutateFn<TData, TError, TParams>,
> {
	mutate: TMutateFn
	notify: NotificationOpenFn
	go: Router['go']
	getProps: (values: TParams) => Parameters<TMutateFn>[0]
	getOptions: () => Parameters<TMutateFn>[1]
	getRedirectTo?: () => RouterGoParams | undefined
}

export type SaveCreateFn<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> = SaveFunction<TParams, CreateResult<TData>, TError, CreateMutationProps<TParams>>

export function createSaveCreateFn<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	props: CreateSaveCreateFnProps<TData, TError, TParams>,
): SaveCreateFn<TData, TError, TParams> {
	return async (
		values,
		options,
	) => {
		try {
			await props.mutate(
				props.getProps(values),
				toMutateOptions(props.getOptions(), options),
			)

			props.notify({
				message: 'ra.notification.updated', // TODO: translate
				type: NotificationType.Success,
			})

			const redirectTo = props.getRedirectTo?.()
			if (redirectTo)
				props.go(redirectTo)
		}
		catch (error) {
			props.notify({
				message: getErrorMessage(error) ?? 'ra.notification.http_error', // TODO: translate
				type: NotificationType.Error,
			})
		}
	}
}
