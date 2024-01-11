import type { Simplify } from 'type-fest'
import type { MutationObserverOptions, QueryClient } from '@tanstack/query-core'
import type { BaseRecord, CreateProps, CreateResult } from '../query/fetcher'
import { InvalidateTarget, triggerInvalidates } from '../query/invalidate'
import type { InvalidateTargetType, InvalidatesProps } from '../query/invalidate'
import { type Fetchers, getFetcher } from '../query/fetchers'
import { NotificationType, type NotifyFn } from '../notification'
import type { TranslateFn } from '../i18n'
import type { CheckErrorMutationFn } from '../auth'
import { getErrorMessage } from '../controller/error'
import type { FetcherProps } from './fetchers'
import { type NotifyProps, resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'

export type MutationProps<
	TData extends BaseRecord,
	TError,
	TParams,
> = Simplify<
	& CreateProps<TParams>
	& FetcherProps
	& InvalidatesProps
	& NotifyProps<CreateResult<TData>, CreateProps<TParams>, TError>
>

export type MutationOptions<
	TData extends BaseRecord,
	TError,
	TParams,
> = MutationObserverOptions<
	CreateResult<TData>,
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
		const fetcher = getFetcher(props, fetchers)
		const result = await fetcher.create<TData, TParams>(props)
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
	return async function onSuccess(data, variables) {
		const {
			resource,
			successNotify,
		} = variables

		notify(
			resolveSuccessNotifyParams(successNotify, data, variables),
			{
				key: `create-${resource}-notification`,
				message: translate('notifications.createSuccess'),
				description: translate('notifications.success'),
				type: NotificationType.Success,
			},
		)

		await triggerInvalidates({
			...variables,
			// eslint-disable-next-line ts/no-use-before-define
			invalidates: variables.invalidates ?? DEFAULT_INVALIDATES,
		}, queryClient)

		// TODO: publish
		// TODO: logs
	}
}

export interface CreateErrorHandlerProps {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	checkError: CheckErrorMutationFn<unknown>
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
	return async function onError(error, variables) {
		await checkError(error)

		const {
			resource,
			errorNotify,
		} = variables

		notify(
			resolveErrorNotifyParams(errorNotify, error, variables),
			{
				key: `create-${resource}-notification`,
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