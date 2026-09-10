import type { PlaceholderDataFunction, QueryClient, QueryFunctionContext, QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { QueryCallbacks } from 'tanstack-query-callbacks'
import type { SetOptional, Simplify } from 'type-fest'
import type { CheckError } from '../auth'
import type { Translate } from '../i18n'
import type { Notify } from '../notification'
import type { RealtimeOption, SubscribeManyParams } from '../realtime'
import type { QueryEnabledFn } from '../utils/query'
import type { PromiseResolvePair, ResolveArgsResult } from './aggregate'
import type { BaseRecord, GetManyFn, GetManyProps, GetManyResult, GetOneResult } from './fetcher'
import type { FetcherProps, Fetchers, ResolvedFetcherProps } from './fetchers'
import type { NotifyProps } from './notify'
import type { RealtimeProps } from './realtime'
import type { ResourceQueryProps } from './resource'
import { hashKey } from '@tanstack/query-core'
import { uniq } from 'es-toolkit'
import { NotificationType } from '../notification'
import { SubscribeType } from '../realtime'
import { getErrorMessage } from '../utils/error'
import { getQuery, resolveQueryEnableds } from '../utils/query'
import { createAggregateFn } from './aggregate'
import { getFetcherFn, getSafeFetcherFn, resolveFetcherProps } from './fetchers'
import { createQueryKey as genGetOneQueryKey } from './get-one'
import { fakeMany } from './helper'
import { resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'
import { createQueryKey as genResourceQueryKey } from './resource'

export type QueryOptions<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = Simplify<
	& QueryObserverOptions<
		GetManyResult<TData>,
		TError,
		GetManyResult<TResultData>,
		GetManyResult<TData>
	>
	& QueryCallbacks<
		GetManyResult<TResultData>,
		TError
	>
>

export type QueryProps = Simplify<
	& SetOptional<
		GetManyProps,
		| 'ids'
		| 'resource'
	>
	& FetcherProps
	& {
		aggregate?: boolean
	}
>

export type ResolvedQueryProps = Simplify<
	& GetManyProps
	& ResolvedFetcherProps
	& {
		aggregate: boolean
	}
>

export function resolveQueryProps(
	props: QueryProps,
): ResolvedQueryProps {
	return {
		...resolveFetcherProps(props),
		ids: props.ids ?? [],
		resource: props.resource ?? '',
		meta: props.meta,
		aggregate: props.aggregate ?? true,
	}
}

export type Props<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = Simplify<
	& QueryProps
	& NotifyProps<GetManyResult<TResultData>, ResolvedQueryProps, TError>
	& RealtimeProps<unknown> // TODO:
	& {
		queryOptions?: Omit<
			QueryOptions<TData, TError, TResultData>,
			| 'queryFn'
			| 'queryKey'
		>
	}
>

export interface CreateBaseQueryKeyProps {
	props: ResourceQueryProps
}

export function createBaseQueryKey(
	{
		props,
	}: CreateBaseQueryKeyProps,
): QueryKey {
	return [
		...genResourceQueryKey({ props }),
		'getMany',
	]
}

export interface CreateQueryKeyProps {
	props: ResolvedQueryProps
}

export function createQueryKey(
	{
		props,
	}: CreateQueryKeyProps,
): QueryKey {
	const { ids, meta } = props

	return [
		...createBaseQueryKey({ props }),
		ids && ids.map(String),
		{ meta },
	]
}

export interface CreateQueryFnProps {
	fetchers: Fetchers
	queryClient: QueryClient
	getProps: () => ResolvedQueryProps
}

const EMPTY_RESULT: GetManyResult<any> = { data: [] }

export function createQueryFn<
	TData extends BaseRecord,
	TResultData extends BaseRecord,
	TError,
>(
	{
		fetchers,
		queryClient,
		getProps,
	}: CreateQueryFnProps,
): NonNullable<QueryOptions<TData, TError, TResultData>['queryFn']> {
	return async function queryFn(context) {
		const props = getProps()
		if (!props.ids || !props.ids.length)
			return EMPTY_RESULT

		const result = props.aggregate
			? await aggregExecGetMany(props, fetchers, context)
			: await execGetMany(props, fetchers, context)

		updateCache(queryClient, props, result)

		return result
	}
}

export interface CreatePlaceholderDataFnProps {
	getProps: () => ResolvedQueryProps
	queryClient: QueryClient
}

export function createPlaceholderDataFn<
	TData extends BaseRecord,
	TError,
>(
	{
		getProps,
		queryClient,
	}: CreatePlaceholderDataFnProps,
): PlaceholderDataFunction<GetManyResult<TData>, TError, GetManyResult<TData>> {
	return function placeholderDataFn(previousData) {
		const { ids, ...rest } = getProps()
		if (!ids || ids.length === 0)
			return

		const cached: TData[] = []
		for (const id of ids) {
			const item = queryClient.getQueryData<GetOneResult<TData>>(
				genGetOneQueryKey({ props: { ...rest, id } }),
			)
			if (item == null)
				return previousData
			cached.push(item.data)
		}
		return {
			data: cached,
		}
	}
}

export interface CreateSuccessHandlerProps<
	TResultData extends BaseRecord,
> {
	notify: Notify.Fn
	getProps: () => ResolvedQueryProps
	getSuccessNotify: () => NotifyProps<GetManyResult<TResultData>, ResolvedQueryProps, unknown>['successNotify']
	emitParent: NonNullable<QueryOptions<any, unknown, TResultData>['onSuccess']>
}

export function createSuccessHandler<
	TData extends BaseRecord,
	TResultData extends BaseRecord,
>(
	{
		notify,
		getProps,
		getSuccessNotify,
		emitParent,
	}: CreateSuccessHandlerProps<TResultData>,
): NonNullable<QueryOptions<TData, unknown, TResultData>['onSuccess']> {
	return function onSuccess(data) {
		emitParent(data)

		const props = getProps()
		const successNotify = getSuccessNotify()

		notify(
			resolveSuccessNotifyParams(successNotify, data, props),
		)
	}
}

export interface CreateErrorHandlerProps<
	TError,
> {
	notify: Notify.Fn
	translate: Translate.Fn<any>
	getProps: () => ResolvedQueryProps
	getErrorNotify: () => NotifyProps<GetManyResult<any>, ResolvedQueryProps, TError>['errorNotify']
	checkError: CheckError.MutateAsyncFn<TError, unknown>
	emitParent: NonNullable<QueryOptions<any, TError, any>['onError']>
}

export function createErrorHandler<
	TError,
>(
	{
		getProps,
		getErrorNotify,
		notify,
		translate,
		checkError,
		emitParent,
	}: CreateErrorHandlerProps<TError>,
): NonNullable<QueryOptions<any, TError, any>['onError']> {
	return function onError(error) {
		checkError(error)

		emitParent(error)

		const props = getProps()
		const errorNotify = getErrorNotify()

		notify(
			resolveErrorNotifyParams(errorNotify, error, props),
			{
				key: `${props.resource}-get-many-${props.ids}-notification`,
				message: translate('notifications.getManyErrors'),
				description: getErrorMessage(error),
				type: NotificationType.Error,
			},
		)
	}
}

export interface CreateQueryEnabledFnProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> {
	getQueryKey: () => QueryKey
	getEnabled: () => QueryOptions<TData, TError, TResultData>['enabled']
	getIds: () => ResolvedQueryProps['ids']
	getResource: () => ResolvedQueryProps['resource']
	getQueryOptions: () => Pick<QueryOptions<TData, TError, TResultData>, 'queryHash' | 'queryKeyHashFn'> | undefined
	queryClient: QueryClient
}

export function createQueryEnabledFn<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
>(
	{
		getQueryKey,
		getEnabled,
		getIds,
		getResource,
		getQueryOptions,
		queryClient,
	}: CreateQueryEnabledFnProps<TData, TError, TResultData>,
): QueryEnabledFn<GetManyResult<TData>, TError, GetManyResult<TData>> {
	return function enabled(
		query = getQuery<GetManyResult<TData>, TError, GetManyResult<TData>>({
			...getQueryOptions(),
			queryKey: getQueryKey(),
			queryClient,
		}),
	) {
		return resolveQueryEnableds(
			query,
			[
				getEnabled(),
				() => {
					const resource = getResource()
					const ids = getIds()

					return resource != null && resource !== ''
						&& ids.length > 0
				},
			],
		)
	}
}

export interface GetSubscribeParamsProps {
	queryProps: ResolvedQueryProps
	realtimeOptions: RealtimeOption.Normalized<unknown>
}

export function getSubscribeParams(
	{
		queryProps,
		realtimeOptions,
	}: GetSubscribeParamsProps,
): SubscribeManyParams {
	return {
		type: SubscribeType.Many,
		resource: queryProps.resource,
		ids: queryProps.ids,
		meta: queryProps.meta,
		...realtimeOptions.params,
	}
}

function execGetMany<
	TData extends BaseRecord,
>(
	props: ResolvedQueryProps,
	fetchers: Fetchers,
	context: QueryFunctionContext,
): Promise<GetManyResult<TData>> {
	const getMany = getSafeFetcherFn(props, fetchers, 'getMany')
	if (getMany != null)
		return (getMany as GetManyFn<TData>)(props, context)
	const getOne = getFetcherFn(props, fetchers, 'getOne')
	return fakeMany(props.ids.map(id => (getOne as any)({ ...props, id }, context)))
}

type ExecGetManyArgs = Parameters<typeof execGetMany>

export function resolveAggregateArgs(
	allArgs: ExecGetManyArgs[],
	allResolves: PromiseResolvePair<GetManyResult<any>>[],
): ResolveArgsResult<ExecGetManyArgs, GetManyResult<any>> {
	const groups = new Map<string, {
		args: ExecGetManyArgs
		ids: ResolvedQueryProps['ids']
		resolves: PromiseResolvePair<GetManyResult<any>>[]
	}>()

	for (const [index, args] of allArgs.entries()) {
		const [props] = args
		const key = hashKey([props.fetcherName, props.resource, props.meta])
		const group = groups.get(key) ?? { args, ids: [], resolves: [] }
		group.ids.push(...props.ids)
		group.resolves.push(allResolves[index]!)
		groups.set(key, group)
	}

	return Array.from(groups.values(), ({ args: [props, ...rest], ids, resolves }) => [
		[{ ...props, ids: uniq(ids) }, ...rest],
		resolves,
	])
}

const execGetManyMerged = createAggregateFn(execGetMany, resolveAggregateArgs)

// Aggregated callers share one merged response; hand back only the records this caller asked for.
async function aggregExecGetMany<
	TData extends BaseRecord,
>(
	props: ResolvedQueryProps,
	fetchers: Fetchers,
	context: QueryFunctionContext,
): Promise<GetManyResult<TData>> {
	const merged = await execGetManyMerged<TData>(props, fetchers, context)
	if (merged.data.some(record => record.id == null))
		throw new Error('[@ginjou/core] Cannot aggregate getMany results without an \'id\' on every record. Return stable record ids or set aggregate to false.')
	const wanted = new Set(props.ids.map(String))
	return { ...merged, data: merged.data.filter(record => wanted.has(String(record.id))) }
}

function updateCache<
	TData extends BaseRecord,
>(
	queryClient: QueryClient,
	props: ResolvedQueryProps,
	result: GetManyResult<TData>,
): void {
	for (const record of result.data) {
		if (record.id == null)
			continue

		queryClient.setQueryData<GetOneResult<TData>>(
			genGetOneQueryKey({
				props: { ...props, id: record.id },
			}),
			old => old ?? { data: record },
		)
	}
}
