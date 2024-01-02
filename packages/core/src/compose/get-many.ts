import type { SetOptional, SetRequired, Simplify } from 'type-fest'
import type { QueryClient, QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import { hashQueryKey } from '@tanstack/query-core'
import type { BaseRecord, Fetcher, GetManyProps, GetManyResult, GetOneResult } from '../query/fetcher'
import type { Fetchers } from '../query/fetchers'
import { getFetcher } from '../query/fetchers'
import { createAggregrateFn } from '../query/aggregrate'
import { fakeMany } from '../query/helper'
import { NotificationType, type NotifyFn } from '../notification'
import type { TranslateFn } from '../i18n'
import type { CheckErrorMutationFn } from '../auth'
import { getErrorMessage } from '../controller/error'
import { resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'
import type { NotifyProps } from './notify'
import type { FetcherProps } from './fetchers'
import type { ResolvedQueryProps as GetOneResolvedQueryProps } from './get-one'
import { createQueryKey as createGetOneQueryKey } from './get-one'

export type QueryOptions<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = QueryObserverOptions<
	GetManyResult<TData>,
	TError,
	GetManyResult<TResultData>
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
	& SetRequired<
			FetcherProps,
			| 'fetcherName'
		>
	& {
		aggregate: boolean
	}
>

export function resolveQueryProps(
	props: QueryProps,
): ResolvedQueryProps {
	return {
		ids: props.ids ?? [],
		resource: props.resource ?? '',
		meta: props.meta,
		aggregate: props.aggregate ?? true,
		fetcherName: props.fetcherName ?? 'default',
	}
}

export interface CreateQueryKeyProps {
	props: ResolvedQueryProps
}

export function createQueryKey(
	{
		props: {
			fetcherName,
			resource,
			ids,
			meta,
		},
	}: CreateQueryKeyProps,
): QueryKey {
	return [
		fetcherName,
		resource,
		'getMany',
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
	return async function queryFn() {
		const _props = getProps()
		if (!_props.ids || !_props.ids.length)
			return EMPTY_RESULT

		const _fetcher = getFetcher(_props, fetchers)
		const result = _props.aggregate
			// eslint-disable-next-line ts/no-use-before-define
			? await aggregExecGetMany(_props, _fetcher)
			: await execGetMany(_props, _fetcher)

		updateCache(queryClient, _props, result)

		return result
	}
}

export interface CreatePlacholerDataFnProps {
	getProps: () => ResolvedQueryProps
	queryClient: QueryClient
}

export function createPlacholerDataFn<
	TData extends BaseRecord,
	TResultData extends BaseRecord,
	TError,
>(
	{
		getProps,
		queryClient,
	}: CreatePlacholerDataFnProps,
): NonNullable<QueryOptions<TData, TError, TResultData>['placeholderData']> {
	return function placeholderDataFn() {
		const { ids, ...rest } = getProps()
		const records = (!ids || ids.length === 0)
			? []
			: ids.map(id => findGetOneCached<TData, TError, TResultData>(
				{ ...rest, id },
				queryClient,
			))

		if (records.includes(undefined))
			return undefined

		return {
			data: records,
		} as unknown as GetManyResult<TData>
	}
}

export interface CreateSuccessHandlerProps<
	TResultData extends BaseRecord,
> {
	notify: NotifyFn
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

		const _props = getProps()
		const successNotify = getSuccessNotify()

		notify(
			resolveSuccessNotifyParams(successNotify, data, _props),
		)
	}
}

export interface CreateErrorHandlerProps<
	TError,
> {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	getProps: () => ResolvedQueryProps
	getErrorNotify: () => NotifyProps<GetManyResult<any>, ResolvedQueryProps, TError>['errorNotify']
	checkError: CheckErrorMutationFn<unknown>
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

		const _props = getProps()
		const errorNotify = getErrorNotify()

		notify(
			resolveErrorNotifyParams(errorNotify, error, _props),
			{
				key: `${_props.resource}-get-many-${_props.ids[0]}-notification`,
				message: translate('notifications.getManyErrors'),
				description: getErrorMessage(error),
				type: NotificationType.Error,
			},
		)
	}
}

export interface GetQueryEnabledProps {
	props: ResolvedQueryProps
	enabled?: boolean
}

export function getQueryEnabled(
	{
		enabled,
		props,
	}: GetQueryEnabledProps,
): boolean {
	return enabled != null
		? enabled
		: props.resource != null && props.resource !== ''
			&& props.ids.length > 0
}

function execGetMany<
	TData extends BaseRecord,
>(
	props: ResolvedQueryProps,
	fetcher: Fetcher,
) {
	return typeof fetcher.getMany === 'function'
		? fetcher.getMany<TData>(props)
		: fakeMany(props.ids.map(id => fetcher.getOne<TData>({ ...props, id })))
}

const aggregExecGetMany = createAggregrateFn(
	execGetMany,
	(allArgs, allResolves) => {
		type ResourceMap = Record<string, { args: typeof allArgs[0][]; resolves: typeof allResolves[0][] }>
		type Result = [typeof allArgs[0], typeof allResolves[0][]][]

		const resourceMap = allArgs.reduce((obj, args, index) => {
			const [props] = args
			const key = [props.fetcherName, props.resource].join('.')

			obj[key] ??= {
				args: [],
				resolves: [],
			}
			obj[key].args.push(args)
			obj[key].resolves.push(allResolves[index])

			return obj
		}, {} as ResourceMap)

		return Object.entries(resourceMap).reduce<Result>((result, [, value]) => {
			const ids = Object.keys(
				value.args
					.reduce((obj, [props]) => {
						props.ids.forEach((id) => {
							obj[id] = true
						})
						return obj
					}, {} as Record<string, boolean>),
			).filter(Boolean)

			const args = value.args[0]
			args[0] = { ...args[0], ids }

			result.push([
				args,
				value.resolves,
			])
			return result
		}, [])
	},
)

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
			createGetOneQueryKey({
				props: { ...props, id: record.id },
			}),
			old => old ?? { data: record },
		)
	}
}

function findGetOneCached<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
>(
	props: GetOneResolvedQueryProps,
	queryClient: QueryClient,
): GetOneResult<TResultData> | undefined {
	const queryCache = queryClient.getQueryCache()
	const queryHash = hashQueryKey(createGetOneQueryKey({ props }))
	return queryCache.get<GetOneResult<TData>, TError, GetOneResult<TResultData>>(queryHash)?.state.data
}
