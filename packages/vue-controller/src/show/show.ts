import type { Simplify } from 'type-fest'
import type { ComputedRef } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import { includeKeys } from 'filter-obj'
import { useGetOne } from '@ginjou/vue-query'
import type { UseGetOneContext, UseGetOneProps, UseGetOneResult } from '@ginjou/vue-query'
import type { BaseRecord } from '@ginjou/query'
import type { MaybeRef } from '@vueuse/shared'

export type UseShowProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = Simplify<
	& UseGetOneProps<TData, TError, TResultData>
	& {
		resource: MaybeRef<string>
	}
>

export type UseShowContext =
	& UseGetOneContext

export type UseShowResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = Simplify<
	& Pick<UseGetOneResult<TData, TError, TResultData>, typeof PICKED_QUERY_FIELDS[number]>
	& {
		record: ComputedRef<TResultData | undefined>
	}
>

export function useShow<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props: UseShowProps<TData, TError, TResultData>,
	context?: UseShowContext,
): UseShowResult<TData, TError, TResultData> {
	const queryOptions = computed(() => ({
		retry: false,
		...unref(props.queryOptions),
	}))

	const one = useGetOne<TData, TError, TResultData>({
		...props,
		queryOptions,
	}, context)

	const record = computed(() => unref(one.data)?.data)

	// TODO: feature: resource
	// TODO: feature: notify msg when error

	return {
		// eslint-disable-next-line ts/no-use-before-define
		...includeKeys(one, PICKED_QUERY_FIELDS),
		record,
	}
}

const PICKED_QUERY_FIELDS = [
	'error',
	'isFetching',
	'isLoading',
	'refetch',
] as const
