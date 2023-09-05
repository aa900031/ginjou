import type { PlaceholderDataFunction, QueryClient, QueryFunction, QueryKey } from '@tanstack/query-core'
import { findGetOneCached, genGetOneQueryKey } from './get-one'
import { fakeMany } from './helper'
import { genResourceQueryKey } from './resource'
import { createAggregrateFn } from './aggregrate'
import type { BaseRecord, Fetcher, GetManyProps, GetManyResult, Meta } from './fetcher'
import type { Fetchers } from './fetchers'
import { getFetcher } from './fetchers'

export type GetManyQueryProps =
	& GetManyProps
	& {
		fetcherName?: string
		aggregate?: boolean
	}

export function genGetManyQueryKey(
	props: GetManyQueryProps | {
		resource: string
		fetcherName?: string
		meta?: Meta
		ids?: undefined
	},
): QueryKey {
	const { fetcherName, resource, ids, meta } = props

	return [
		genResourceQueryKey({
			fetcherName,
			resource,
		}),
		'getMany',
		ids && ids.map(String),
		{
			meta,
		},
	]
}

const EMPTY_RESULT: GetManyResult<any> = { data: [] }

export function createGetManyQueryFn<
	TData extends BaseRecord = BaseRecord,
>(
	getProps: () => GetManyQueryProps,
	queryClient: QueryClient,
	fetchers: Fetchers,
): QueryFunction<GetManyResult<TData>> {
	return async function getManyQueryFn() {
		const props = getProps()
		if (!props.ids || !props.ids.length)
			return EMPTY_RESULT

		const fetcher = getFetcher(props, fetchers)

		const result = props.aggregate
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			? await aggregExecGetMany(props, fetcher)
			: await execGetMany(props, fetcher)

		updateCache(queryClient, props, result)

		return result
	}
}

export function createGetManyPlacholerDataFn<
	TData extends BaseRecord = BaseRecord,
>(
	getProps: () => GetManyQueryProps,
	queryClient: QueryClient,
): PlaceholderDataFunction<GetManyResult<TData>> {
	return function getManyPlaceholderDataFn() {
		const { ids, ...rest } = getProps()
		const records = (!ids || ids.length === 0)
			? []
			: ids.map(id => findGetOneCached<TData>({ ...rest, id }, queryClient))

		if (records.includes(undefined))
			return undefined

		return {
			data: records,
		} as unknown as GetManyResult<TData>
	}
}

function execGetMany<
	TData extends BaseRecord,
>(
	props: GetManyQueryProps,
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
	TData extends BaseRecord = BaseRecord,
>(
	queryClient: QueryClient,
	props: GetManyQueryProps,
	result: GetManyResult<TData>,
): void {
	for (const record of result.data) {
		queryClient.setQueryData(
			genGetOneQueryKey({ ...props, id: record.id! }),
			(old: TData | undefined) => old ?? record,
		)
	}
}
