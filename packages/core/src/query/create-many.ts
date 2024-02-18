import type { Simplify } from 'type-fest'
import type { MutationObserverOptions, QueryClient } from '@tanstack/query-core'
import type { NotifyFn } from '../notification'
import { NotificationType } from '../notification'
import type { TranslateFn } from '../i18n'
import type { CheckError } from '../auth'
import { getErrorMessage } from '../utils/error'
import type { InvalidateTargetType, InvalidatesProps, ResolvedInvalidatesProps } from './invalidate'
import { InvalidateTarget, resolveInvalidateProps, triggerInvalidates } from './invalidate'
import { fakeMany } from './helper'
import { getFetcher, resolveFetcherProps } from './fetchers'
import type { FetcherProps, Fetchers, ResolvedFetcherProps } from './fetchers'
import type { BaseRecord, CreateManyProps, CreateManyResult } from './fetcher'
import type { NotifyProps } from './notify'
import { resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'

export type MutationProps<
	TData extends BaseRecord,
	TError,
	TParams,
> = Simplify<
	& CreateManyProps<TParams>
	& FetcherProps
	& InvalidatesProps
	& NotifyProps<CreateManyResult<TData>, CreateManyProps<TParams>, TError>
>

export type ResolvedMutationProps<
	TData extends BaseRecord,
	TError,
	TParams,
> = Simplify<
	& MutationProps<TData, TError, TParams>
	& ResolvedFetcherProps
	& ResolvedInvalidatesProps
>

export type MutationOptions<
	TData extends BaseRecord,
	TError,
	TParams,
> = MutationObserverOptions<
	CreateManyResult<TData>,
	TError,
	MutationProps<TData, TError, TParams>
>

export interface CreateMutationFnProps {
	fetchers: Fetchers
}

export function createMutationFn<
	TData extends BaseRecord,
	TParams,
>(
	{
		fetchers,
	}: CreateMutationFnProps,
): NonNullable<MutationOptions<TData, unknown, TParams>['mutationFn']> {
	return async function mutationFn(props) {
		const resolveProps = resolveMutationProps(props)
		const fetcher = getFetcher(resolveProps, fetchers)
		const result = typeof fetcher.createMany === 'function'
			? await fetcher.createMany<TData, TParams>(resolveProps)
			: await fakeMany(resolveProps.params.map(val => fetcher.create<TData, TParams>({ ...resolveProps, params: val })))

		return result
	}
}
export interface CreateSuccessHandlerProps {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	queryClient: QueryClient
}

export function createSuccessHandler<
	TData extends BaseRecord,
	TParams,
>(
	{
		notify,
		translate,
		queryClient,
	}: CreateSuccessHandlerProps,
): NonNullable<MutationOptions<TData, unknown, TParams>['onSuccess']> {
	return async function onSuccess(data, props) {
		const resolvedProps = resolveMutationProps(props)

		notify(
			resolveSuccessNotifyParams(resolvedProps.successNotify, data, resolvedProps),
			{
				key: `create-${resolvedProps.resource}-notification`,
				message: translate('notifications.createSuccess'),
				description: translate('notifications.success'),
				type: NotificationType.Success,
			},
		)

		await triggerInvalidates(resolvedProps, queryClient)

		// TODO: publish
		// TODO: logs
	}
}

export interface CreateErrorHandlerProps {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	checkError: CheckError.MutationFn<unknown>
}

export function createErrorHandler<
	TError,
>(
	{
		notify,
		translate,
		checkError,
	}: CreateErrorHandlerProps,
): NonNullable<MutationOptions<any, TError, any>['onError']> {
	return async function onError(error, props) {
		await checkError(error)

		const resolvedProps = resolveMutationProps(props)

		notify(
			resolveErrorNotifyParams(resolvedProps.errorNotify, error, resolvedProps),
			{
				key: `create-${resolvedProps.resource}-notification`,
				message: translate('notifications.createError'),
				description: getErrorMessage(error),
				type: NotificationType.Error,
			},
		)
	}
}

const DEFAULT_INVALIDATES: InvalidateTargetType[] = [
	InvalidateTarget.List,
	InvalidateTarget.Many,
]

const cacheResolvedProps = new WeakMap<MutationProps<any, any, any>, ResolvedMutationProps<any, any, any>>()

function resolveMutationProps(
	props: MutationProps<any, any, any>,
): ResolvedMutationProps<any, any, any> {
	const cached = cacheResolvedProps.get(props)
	if (cached)
		return cached

	const result: ResolvedMutationProps<any, any, any> = {
		...props,
		...resolveFetcherProps(props),
		...resolveInvalidateProps(props, DEFAULT_INVALIDATES),
	}
	cacheResolvedProps.set(props, result)

	return result
}
