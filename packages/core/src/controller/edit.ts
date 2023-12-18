import type { Router, RouterGoParams } from '../router'
import { RouterGoType } from '../router'
import type { BaseRecord, GetOneResult, UpdateMutateFn, UpdateMutationProps, UpdateResult } from '../query'
import { type SaveFunction, toMutateOptions } from './save'
import { type Notification, NotificationType } from './notification'
import { getErrorMessage } from './error'

export interface CreateSaveEditFnProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
	TMutateFn extends UpdateMutateFn<TData, TError, TParams> = UpdateMutateFn<TData, TError, TParams>,
> {
	mutate: TMutateFn
	notify: Notification['open']
	go: Router['go']
	getProps: (values: TParams) => Parameters<TMutateFn>[0]
	getOptions: () => Parameters<TMutateFn>[1]
	getRedirectTo?: () => RouterGoParams | undefined
}

export type SaveEditFn<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> = SaveFunction<TParams, UpdateResult<TData>, TError, UpdateMutationProps<TParams>>

export function createSaveEditFn<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	props: CreateSaveEditFnProps<TData, TError, TParams>,
): SaveEditFn<TData, TError, TParams> {
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

export interface GetEditRecordProps<
	TResultData extends BaseRecord,
> {
	result: GetOneResult<TResultData> | undefined
}

export function getEditRecord<
	TResultData extends BaseRecord,
>(
	props: GetEditRecordProps<TResultData>,
): TResultData | undefined {
	return props.result?.data
}

export interface HandleEditGetOneErrorProps<
	TError = unknown,
> {
	error: TError
	notify: Notification['open']
	go: Router['go']
}

export function handleEditGetOneError<
	TError = unknown,
>({
	notify,
	go,
}: HandleEditGetOneErrorProps<TError>): void {
	notify({
		type: NotificationType.Error,
		message: 'ra.notification.item_doesnt_exist', // TODO: translate
	})

	go({
		type: RouterGoType.Replace,
		to: '',
	})
}
