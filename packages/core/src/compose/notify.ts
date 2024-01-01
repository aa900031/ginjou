import type { BaseRecord } from '../query'
import type { OpenNotificationParams } from '../notification'

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
	props: TProps
) => NotifyParamsResult

export type CreateErrorNotifyParamsFn<
	TError,
	TProps,
> = (
	error: TError,
	props: TProps
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
