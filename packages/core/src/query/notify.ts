import type { TranslateFn } from '../i18n'
import type { OpenNotificationParams, ProgressNotificationParams } from '../notification'
import type { DeferResult } from '../utils/defer'
import type { BaseRecord, RecordKey } from './fetcher'
import { NotificationType } from '../notification'

export interface NotifyProps<
	TData extends BaseRecord,
	TProps,
	TError,
> {
	successNotify?:
		| NotifyParamsResult
		| CreateSuccessNotifyParamsFn<TData, TProps>
	errorNotify?:
		| NotifyParamsResult
		| CreateErrorNotifyParamsFn<TError, TProps>
}

export type NotifyParamsResult = false | OpenNotificationParams

export type CreateSuccessNotifyParamsFn<
	TData extends BaseRecord,
	TProps,
> = (
	data: TData,
	props: TProps,
) => NotifyParamsResult

export type CreateErrorNotifyParamsFn<
	TError,
	TProps,
> = (
	error: TError,
	props: TProps,
) => NotifyParamsResult

export function resolveSuccessNotifyParams<
	TData extends BaseRecord,
	TProps,
>(
	params:
		|	NotifyParamsResult
		| CreateSuccessNotifyParamsFn<TData, TProps>
		| undefined,
	data: TData,
	props: TProps,
): NotifyParamsResult | undefined {
	if (typeof params === 'function')
		return params(data, props)

	return params
}

export function resolveErrorNotifyParams<
	TError,
	TProps,
>(
	params:
		|	NotifyParamsResult
		| CreateErrorNotifyParamsFn<TError, TProps>
		| undefined,
	error: TError,
	props: TProps,
): NotifyParamsResult | undefined {
	if (typeof params === 'function')
		return params(error, props)

	return params
}

export interface CreateProgressNotifyKeyProps {
	method: 'update' | 'updateMany' | 'delete' | 'deleteMany'
	props: {
		fetcherName: string
		resource: string
		id: RecordKey
	} | {
		fetcherName: string
		resource: string
		ids: RecordKey[]
	}
}

export function createProgressNotifyKey(
	{
		method,
		props,
	}: CreateProgressNotifyKeyProps,
) {
	const { fetcherName, resource } = props
	const identitesText = 'id' in props
		? props.id
		: 'ids' in props
			? props.ids.toString()
			: undefined

	return [
		fetcherName,
		resource,
		method,
		identitesText,
	].join('-')
}

export interface ResolveProgressNotifyParamsProps extends CreateProgressNotifyKeyProps {
	props: CreateProgressNotifyKeyProps['props'] & { undoableTimeout: number }
	defer: DeferResult<unknown>
	translate: TranslateFn<any>
}

export function createProgressNotifyParams(
	{
		method,
		props,
		defer,
		translate,
	}: ResolveProgressNotifyParamsProps,
): ProgressNotificationParams {
	return {
		type: NotificationType.Progress,
		key: createProgressNotifyKey({ props, method }),
		message: translate('notifications.undoable'),
		onFinish: defer.run,
		onCancel: defer.cancel,
		timeout: props.undoableTimeout,
	}
}
