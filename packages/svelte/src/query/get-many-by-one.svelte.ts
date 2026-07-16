import type { BaseRecord, GetManyResult, GetOneResult } from '@ginjou/core'
import type { QueryObserverResult } from '@tanstack/query-core'
import type { Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UseSubscribeContext } from '../realtime'
import type { MaybeAccessor } from '../utils'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { GetManyByOne } from '@ginjou/core'
import { createQueries } from '@tanstack/svelte-query'
import { extract, withAccessors } from '../utils'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseGetManyByOneProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = MaybeAccessor<
	GetManyByOne.Props<TData, TError, TResultData>
>

export type UseGetManyByOneContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
	& UseSubscribeContext
>

export type UseGetManyByOneResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = Simplify<
	& QueryObserverResult<GetManyResult<TResultData>, TError>
	& {
		readonly records: TResultData[] | undefined
	}
>

interface UseGetManyByOneQueryDescriptor<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> {
	queryFnData: GetOneResult<TData>
	error: TError
	data: GetOneResult<TResultData>
}

export function useGetManyByOne<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props: UseGetManyByOneProps<TData, TError, TResultData>,
	context?: UseGetManyByOneContext,
): UseGetManyByOneResult<TData, TError, TResultData> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const resolvedProps = $derived(extract(props))

	const queryProps = $derived.by(() => GetManyByOne.resolveQueryProps({
		ids: extract(resolvedProps.ids),
		resource: extract(resolvedProps.resource),
		meta: extract(resolvedProps.meta),
		fetcherName: extract(resolvedProps.fetcherName),
	}))
	const options = $derived.by(() => GetManyByOne.getQueriesOptions<TData, TError, TResultData>({
		queryProps,
		fetchers,
		queryOptions: resolvedProps.queryOptions,
		queryClient,
	}))
	const combineFn = GetManyByOne.createCombineFn<TResultData, TError>()
	const queries = createQueries<
		UseGetManyByOneQueryDescriptor<TData, TError, TResultData>[],
		QueryObserverResult<GetManyResult<TResultData>, TError>
	>(
		() => ({
			queries: options,
			combine: combineFn,
		}),
		() => queryClient,
	)

	return withAccessors(queries, {
		records: () => queries.data?.data,
	}) as UseGetManyByOneResult<TData, TError, TResultData>
}
