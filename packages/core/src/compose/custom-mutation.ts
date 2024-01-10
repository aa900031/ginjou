import type { Simplify } from 'type-fest'
import type { MutationObserverOptions } from '@tanstack/query-core'
import type { BaseRecord, CustomProps, CustomResult } from '../query/fetcher'
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
	TQuery,
	TPayload,
> = Simplify<
	& CustomProps<TQuery, TPayload>
	& FetcherProps
	& NotifyProps<CustomResult<TData>, CustomProps<TQuery, TPayload>, TError>
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
		const fetcher = getFetcher(props, fetchers)
		if (typeof fetcher.custom !== 'function')
			throw new Error('Not implemented custom on data provider')
		const result = await fetcher.custom<TData, TQuery, TPayload>(props)

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
		const {
			successNotify,
		} = variables

		notify(
			resolveSuccessNotifyParams(successNotify, data, variables),
		)
	}
}

export interface CreateErrorHandlerProps {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	checkError: CheckErrorMutationFn<unknown>
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

		const {
			method,
			errorNotify,
		} = variables

		notify(
			resolveErrorNotifyParams(errorNotify, error, variables),
			{
				key: `${method}-notification`,
				message: translate('notifications.error'),
				description: getErrorMessage(error),
				type: NotificationType.Error,
			},
		)
	}
}
