import type { BaseRecord, GetOneResult, UpdateMutationProps, UpdateResult } from '@ginjou/query'
import { type SaveFunction, mergeSaveOptions } from './save'
import { type Notification, NotificationType } from './notification'
import { RouterGoType } from './router'
import type { Router, RouterGoParams } from './router'
import { getErrorMessage } from './error'

export interface CreateSaveEditFnProps<
	TParams extends Record<string, any> = any,
	TOptions extends Record<string, any> = any, // TODO: use correct type
> {
	mutate: (
		props: UpdateMutationProps<TParams>,
		options: TOptions,
	) => Promise<any> // TODO: refactor to Tanstack mutate types
	notify: Notification['open']
	go: Router['go']
	getProps: (
		values: TParams,
	) => UpdateMutationProps<TParams>
	getOptions: () => TOptions
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
	props: CreateSaveEditFnProps<TParams>,
): SaveEditFn<TData, TError, TParams> {
	return async (
		values,
		options,
	) => {
		try {
			const optionsFromProp = props.getOptions()
			const result = await props.mutate(
				props.getProps(values),
				mergeSaveOptions(options, optionsFromProp),
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
