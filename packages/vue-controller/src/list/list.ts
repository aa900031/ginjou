import type { ComputedRef, Ref } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import type { Simplify } from 'type-fest'
import { includeKeys } from 'filter-obj'
import type { MaybeRef } from '@vueuse/shared'
import { computedEager } from '@vueuse/shared'
import type { UseGetListContext, UseGetListProps, UseGetListResult } from '@ginjou/vue-query'
import { useGetList } from '@ginjou/vue-query'
import type { BaseRecord } from '@ginjou/query'
import { createListHasNextPage, createListHasPreviousPage } from '@ginjou/controller'
import type { UseListParamsResult } from './list-params'
import { useListParams } from './list-params'

export type UseListProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = Simplify<
	& UseGetListProps<TData, TError, TResultData>
	& {
		resource: MaybeRef<string>
	}
>

export type UseListContext = Simplify<
	& UseGetListContext
>

export type UseListResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = Simplify<
	& UseListParamsResult
	& Pick<UseGetListResult<TData, TError, TResultData>, typeof PICKED_QUERY_FIELDS[number]>
	& {
		data: ComputedRef<TResultData[] | undefined>
		total: Readonly<Ref<number | undefined>>
		hasNextPage: Readonly<Ref<boolean | undefined>>
		hasPreviousPage: Readonly<Ref<boolean | undefined>>
	}
>

export function useList<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props: UseListProps<TData, TError, TResultData>,
	context?: UseListContext,
): UseListResult<TData, TError, TResultData> {
	const params = useListParams(props)
	const query = useGetList<TData, TError, TResultData>({
		...props,
		...params,
	}, context)

	const data = computed(() => unref(query.data)?.data)
	const total = computedEager(() => unref(query.data)?.total)
	const hasNextPage = computedEager(() => createListHasNextPage({
		total: unref(total),
		page: unref(params.page),
		perPage: unref(params.perPage),
	}))
	const hasPreviousPage = computedEager(() => createListHasPreviousPage({
		total: unref(total),
		page: unref(params.page),
	}))

	// TODO: feature: resource
	// TODO: feature: notify msg when error
	// TODO: feature: sync to route

	return {
		...params,
		// eslint-disable-next-line ts/no-use-before-define
		...includeKeys(query, PICKED_QUERY_FIELDS),
		data,
		total,
		hasNextPage,
		hasPreviousPage,
	}
}

const PICKED_QUERY_FIELDS = [
	'error',
	'isFetching',
	'isLoading',
	'refetch',
] as const
