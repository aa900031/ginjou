import type { Simplify } from 'type-fest'
import type { MutationObserverOptions } from '@tanstack/query-core'
import { NotificationType, type NotifyFn } from '../notification'
import type { TranslateFn } from '../i18n'
import type { CheckError } from '../auth'
import { getErrorMessage } from '../controller/error'
import { getFetcher, resolveFetcherProps } from './fetchers'
import type { FetcherProps, Fetchers, ResolvedFetcherProps } from './fetchers'
import type { BaseRecord, CustomProps, CustomResult } from './fetcher'
import type { NotifyProps } from './notify'
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

export interface CreateSuccessHandlerProps {
	notify: NotifyFn
}

export function createSuccessHandler<
	TData extends BaseRecord,
	TQuery,
	TPayload,
>(
	{
		notify,
	}: CreateSuccessHandlerProps,
): NonNullable<MutationOptions<TData, unknown, TQuery, TPayload>['onSuccess']> {
	return async function onSuccess(data, variables) {
		const resolvedProps = resolveMutationProps(variables)

		notify(
			resolveSuccessNotifyParams(resolvedProps.successNotify, data, resolvedProps),
		)
	}
}

export interface CreateErrorHandlerProps {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	checkError: CheckError.MutationFn<unknown>
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
	}: CreateErrorHandlerProps,
): NonNullable<MutationOptions<any, TError, TQuery, TPayload>['onError']> {
	return async function onError(error, variables) {
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
