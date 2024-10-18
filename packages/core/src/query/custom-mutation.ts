import type { MutationObserverOptions } from '@tanstack/query-core'
import type { Simplify } from 'type-fest'
import type { CheckError } from '../auth'
import type { TranslateFn } from '../i18n'
import type { Publish } from '../realtime'
import type { BaseRecord, CustomProps, CustomResult } from './fetcher'
import type { FetcherProps, Fetchers, ResolvedFetcherProps } from './fetchers'
import type { NotifyProps } from './notify'
import { NotificationType, type NotifyFn } from '../notification'
import { getErrorMessage } from '../utils/error'
import { getFetcher, resolveFetcherProps } from './fetchers'
import { resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'

export type MutationProps<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
> = Simplify<
	& CustomProps<TQuery, TPayload>
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
	TQuery,
	TPayload,
> = Simplify<
	& MutationProps<TData, TError, TQuery, TPayload>
	& ResolvedFetcherProps
>

export type MutationOptions<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
> = MutationObserverOptions<
	CustomResult<TData>,
	TError,
	MutationProps<TData, TError, TQuery, TPayload>
>

export type MutationOptionsFromProps<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
> = Omit<
	MutationOptions<TData, TError, TQuery, TPayload>,
	| 'mutationFn'
	| 'queryClient'
>

export interface CreateMutationFnProps {
	fetchers: Fetchers
}

export function createMutationFn<
	TData extends BaseRecord,
	TQuery,
	TPayload,
>(
	{
		fetchers,
	}: CreateMutationFnProps,
): NonNullable<MutationOptions<TData, unknown, TQuery, TPayload>['mutationFn']> {
	return async function mutationFn(props) {
		const resolvedProps = resolveMutationProps(props)
		const fetcher = getFetcher(resolvedProps, fetchers)
		if (typeof fetcher.custom !== 'function')
			throw new Error('Not implemented custom on data provider')

		const result = await fetcher.custom<TData, TQuery, TPayload>(resolvedProps)

		return result
	}
}

export interface CreateSuccessHandlerProps<
	TData extends BaseRecord,
	TQuery,
	TPayload,
> {
	notify: NotifyFn
	publish: Publish.EmitFn<TPayload>
	onSuccess: MutationOptions<TData, any, TQuery, TPayload>['onSuccess']
}

export function createSuccessHandler<
	TData extends BaseRecord,
	TQuery,
	TPayload,
>(
	{
		notify,
		publish,
		onSuccess: onSuccessFromProp,
	}: CreateSuccessHandlerProps<TData, TQuery, TPayload>,
): NonNullable<MutationOptions<TData, unknown, TQuery, TPayload>['onSuccess']> {
	return async function onSuccess(data, variables, context) {
		const resolvedProps = resolveMutationProps(variables)

		notify(
			resolveSuccessNotifyParams(resolvedProps.successNotify, data, resolvedProps),
		)

		if (variables.publish) {
			const event = typeof variables.publish === 'function'
				? variables.publish(resolvedProps, data)
				: variables.publish

			publish(event)
		}

		await onSuccessFromProp?.(data, resolvedProps, context)
	}
}

export interface CreateErrorHandlerProps<
	TError,
	TQuery,
	TPayload,
> {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	checkError: CheckError.MutationFn<unknown>
	onError: MutationOptions<any, TError, TQuery, TPayload>['onError']
}

export function createErrorHandler<
	TError,
	TQuery,
	TPayload,
>(
	{
		notify,
		translate,
		checkError,
		onError: onErrorFromProp,
	}: CreateErrorHandlerProps<TError, TQuery, TPayload>,
): NonNullable<MutationOptions<any, TError, TQuery, TPayload>['onError']> {
	return async function onError(error, variables, context) {
		await checkError(error)

		const resolvedProps = resolveMutationProps(variables)

		notify(
			resolveErrorNotifyParams(resolvedProps.errorNotify, error, resolvedProps),
			{
				key: `${resolvedProps.method}-notification`,
				message: translate('notifications.error'),
				description: getErrorMessage(error),
				type: NotificationType.Error,
			},
		)

		await onErrorFromProp?.(error, resolvedProps, context)
	}
}

const cacheResolvedProps = new WeakMap<MutationProps<any, any, any, any>, ResolvedMutationProps<any, any, any, any>>()

function resolveMutationProps(
	props: MutationProps<any, any, any, any>,
): ResolvedMutationProps<any, any, any, any> {
	const cached = cacheResolvedProps.get(props)
	if (cached)
		return cached

	const result: ResolvedMutationProps<any, any, any, any> = {
		...props,
		...resolveFetcherProps(props),
	}
	cacheResolvedProps.set(props, result)

	return result
}
