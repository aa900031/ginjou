import type { MutationObserverOptions } from '@tanstack/query-core'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { CheckError } from '../auth'
import type { TranslateFn } from '../i18n'
import type { NotifyFn } from '../notification'
import type { Publish } from '../realtime'
import type { BaseRecord, CustomFn, CustomProps, CustomResult, Params } from './fetcher'
import type { FetcherProps, Fetchers, ResolvedFetcherProps } from './fetchers'
import type { NotifyProps } from './notify'
import type { OptionalMutateAsyncFunction, OptionalMutateSyncFunction, OriginMutateAsyncFunction, OriginMutateSyncFunction } from './types'
import { NotificationType } from '../notification'
import { getErrorMessage } from '../utils/error'
import { getFetcherFn, resolveFetcherProps } from './fetchers'
import { resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'

export type MutationProps<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
> = Simplify<
	& Partial<CustomProps<TQuery, TPayload>>
	& FetcherProps
	& NotifyProps<CustomResult<TData>, CustomProps<TQuery, TPayload>, TError>
	& {
		publish?:
			| Publish.EmitEvent<TPayload>
			| (
				(
					props: ResolvedMutationProps<TData, TError, TQuery, TPayload>,
					data: CustomResult<TData>,
				) => Publish.EmitEvent<TPayload>
			)
	}
>

export type ResolvedMutationProps<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
> = Simplify<
	& OverrideProperties<
		MutationProps<TData, TError, TQuery, TPayload>,
		CustomProps<TQuery, TPayload>
	>
	& ResolvedFetcherProps
>

export type MutationOptions<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
	TMutateResult,
> = MutationObserverOptions<
	CustomResult<TData>,
	TError,
	MutationProps<TData, TError, TQuery, TPayload>,
	TMutateResult
>

export type MutationOptionsFromProps<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
	TMutateResult,
> = Omit<
	MutationOptions<TData, TError, TQuery, TPayload, TMutateResult>,
	| 'mutationFn'
>

export type Props<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
	TMutateResult,
> = Simplify<
	& MutationProps<TData, TError, TQuery, TPayload>
	& {
		mutationOptions?: MutationOptionsFromProps<TData, TError, TQuery, TPayload, TMutateResult>
	}
>

export type MutateFn<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
> = OptionalMutateSyncFunction<
	CustomResult<TData>,
	TError,
	MutationProps<TData, TError, TQuery, TPayload>
>

export type MutateAsyncFn<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
> = OptionalMutateAsyncFunction<
	CustomResult<TData>,
	TError,
	MutationProps<TData, TError, TQuery, TPayload>
>

export interface CreateMutationFnProps<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
	TMutateResult,
> {
	fetchers: Fetchers
	getProps: () => Props<TData, TError, TQuery, TPayload, TMutateResult> | undefined
}

export function createMutationFn<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
	TMutateResult,
>(
	{
		fetchers,
		getProps,
	}: CreateMutationFnProps<TData, TError, TQuery, TPayload, TMutateResult>,
): NonNullable<MutationOptions<TData, TError, TQuery, TPayload, TMutateResult>['mutationFn']> {
	return async function mutationFn(props, context) {
		const resolvedProps = resolveMutationProps(getProps(), props)
		const custom = getFetcherFn(resolvedProps, fetchers, 'custom') as CustomFn<TData, TQuery, TPayload>
		const result = await custom(resolvedProps, context)

		return result
	}
}

export interface CreateSuccessHandlerProps<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
	TMutateResult,
> {
	notify: NotifyFn
	publish: Publish.EmitFn<TPayload>
	getProps: () => Props<TData, TError, TQuery, TPayload, TMutateResult> | undefined
	onSuccess: MutationOptions<TData, TError, TQuery, TPayload, TMutateResult>['onSuccess']
}

export function createSuccessHandler<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
	TMutateResult,
>(
	{
		notify,
		publish,
		getProps,
		onSuccess: onSuccessFromProp,
	}: CreateSuccessHandlerProps<TData, TError, TQuery, TPayload, TMutateResult>,
): NonNullable<MutationOptions<TData, TError, TQuery, TPayload, TMutateResult>['onSuccess']> {
	return async function onSuccess(data, props, onMutateResult, context) {
		const resolvedProps = resolveMutationProps(getProps(), props)

		notify(
			resolveSuccessNotifyParams(resolvedProps.successNotify, data, resolvedProps),
		)

		if (props.publish) {
			const event = typeof props.publish === 'function'
				? props.publish(resolvedProps, data)
				: props.publish

			publish(event)
		}

		await onSuccessFromProp?.(data, resolvedProps, onMutateResult, context)
	}
}

export interface CreateErrorHandlerProps<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
	TMutateResult,
> {
	notify: NotifyFn
	translate: TranslateFn<any>
	checkError: CheckError.MutateAsyncFn<TError, unknown>
	getProps: () => Props<TData, TError, TQuery, TPayload, TMutateResult> | undefined
	onError: MutationOptions<TData, TError, TQuery, TPayload, TMutateResult>['onError']
}

export function createErrorHandler<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
	TMutateResult,
>(
	{
		notify,
		translate,
		checkError,
		getProps,
		onError: onErrorFromProp,
	}: CreateErrorHandlerProps<TData, TError, TQuery, TPayload, TMutateResult>,
): NonNullable<MutationOptions<TData, TError, TQuery, TPayload, TMutateResult>['onError']> {
	return async function onError(error, props, onMutateResult, context) {
		await checkError(error)

		const resolvedProps = resolveMutationProps(getProps(), props)

		notify(
			resolveErrorNotifyParams(resolvedProps.errorNotify, error, resolvedProps),
			{
				key: `${resolvedProps.method}-notification`,
				message: translate('notifications.error'),
				description: getErrorMessage(error),
				type: NotificationType.Error,
			},
		)

		await onErrorFromProp?.(error, resolvedProps, onMutateResult, context)
	}
}

export interface CreateMutateFnProps<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
> {
	originFn: OriginMutateSyncFunction<
		CustomResult<TData>,
		TError,
		MutationProps<TData, TError, TQuery, TPayload>
	>
}

export function createMutateFn<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
>(
	{
		originFn,
	}: CreateMutateFnProps<TData, TError, TQuery, TPayload>,
): MutateFn<TData, TError, TQuery, TPayload> {
	return function mutateFn(variables, options) {
		return originFn(variables || ({} as any), options)
	}
}

export interface CreateMutateAsyncFnProps<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
> {
	originFn: OriginMutateAsyncFunction<
		CustomResult<TData>,
		TError,
		MutationProps<TData, TError, TQuery, TPayload>
	>
}

export function createMutateAsyncFn<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
>(
	{
		originFn,
	}: CreateMutateAsyncFnProps<TData, TError, TQuery, TPayload>,
): MutateAsyncFn<TData, TError, TQuery, TPayload> {
	return function mutateAsyncFn(variables, options) {
		return originFn(variables || ({} as any), options)
	}
}

function resolveMutationProps<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
	TMutateResult,
>(
	propsFromProps: Props<TData, TError, TQuery, TPayload, TMutateResult> | undefined,
	propsFromFn: MutationProps<TData, TError, TQuery, TPayload>,
): ResolvedMutationProps<TData, TError, TQuery, TPayload> {
	const props = resolveProps(propsFromProps, propsFromFn)
	const result: ResolvedMutationProps<TData, TError, TQuery, TPayload> = {
		...props,
		...resolveFetcherProps(props),
	}

	return result
}

function resolveProps<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
	TMutateResult,
>(
	propsFromProps: Props<TData, TError, TQuery, TPayload, TMutateResult> | undefined,
	propsFromFn: MutationProps<TData, TError, TQuery, TPayload>,
): OverrideProperties<MutationProps<TData, TError, TQuery, TPayload>, CustomProps<TQuery, TPayload>> {
	const props = {
		...propsFromProps,
		...propsFromFn,
	}
	const { url, method } = props
	if (url == null || method == null)
		throw new Error('No') // TODO:

	return {
		...props,
		url,
		method,
	}
}
