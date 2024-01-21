import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import { computed, ref, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import { watchDebounced } from '@vueuse/shared'
import type { BaseRecord, Filters, Sorters } from '@ginjou/core'
import { List } from '@ginjou/core'
import { useGetList } from '../query'
import type { UseGetListContext, UseGetListProps, UseGetListResult } from '../query'
import type { UseResourceContext } from '../resource'
import { useResource } from '../resource'
import type { UseGoContext } from '../router'
import { useGo } from '../router'

export type UseListProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = Simplify<
	& UseGetListProps<TData, TError, TResultData, TPageParam>
	& {
		pagination?: MaybeRef<List.PaginationOptions<TPageParam>>
		sorters?: MaybeRef<List.SortersOptions>
		filters?: MaybeRef<List.FiltersOptions>
		syncRoute?: MaybeRef<boolean | undefined>
	}
>

export type UseListContext = Simplify<
	& UseGetListContext
	& UseResourceContext
	& UseGoContext
>

export type UseListResult<
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = Simplify<
	& UseGetListResult<TError, TResultData, TPageParam>
	& {
		currentPage: Ref<TPageParam>
		perPage: Ref<number>
		sorters: Ref<Sorters>
		setSorters: List.SetSortersFn
		filters: Ref<Filters>
		setFilters: List.SetFiltersFn

		total: Ref<number | undefined>
		pageCount: Ref<number | undefined>
	}
>

export function useList<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
	TPageParam = number,
>(
	props?: UseListProps<TData, TError, TResultData, TPageParam>,
	context?: UseListContext,
): UseListResult<TError, TResultData, TPageParam> {
	const go = useGo(context)
	const resource = useResource({ name: props?.resource }, context)

	const resourceName = computed(() => List.getResourceName({
		resource: unref(resource),
		resourceFromProps: unref(props?.resource),
	}))

	const currentPage = ref(
		List.getInitialCurrentPage<TPageParam>({
			resource: unref(resource),
			syncRoute: unref(props?.syncRoute),
			paginationFromProp: unref(props?.pagination),
		}),
	) as Ref<TPageParam>
	const perPage = ref(
		List.getInitialPerPage<TPageParam>({
			resource: unref(resource),
			syncRoute: unref(props?.syncRoute),
			paginationFromProp: unref(props?.pagination),
		}),
	)
	const _sorters = ref(
		List.getInitialSorters({
			resource: unref(resource),
			syncRoute: unref(props?.syncRoute),
			sortersFromProp: unref(props?.sorters),
		}),
	)
	const setSorters = List.createSetSortersFn({
		getSortersFormProp: () => unref(props?.sorters),
		update: getter => _sorters.value = getter(unref(_sorters)),
	})
	const _filters = ref(
		List.getInitialFilters({
			resource: unref(resource),
			syncRoute: unref(props?.syncRoute),
			filtersFromProp: unref(props?.filters),
		}),
	)
	const setFilters = List.createSetFiltersFn({
		getFiltersFormProp: () => unref(props?.filters),
		update: getter => _filters.value = getter(unref(_filters)),
	})

	const paginationForQuery = computed(() => List.getPaginationForQuery<TPageParam>({
		paginationFromProp: unref(props?.pagination),
		currentPage: unref(currentPage),
		perPage: unref(perPage),
	}))
	const sortersForQuery = computed(() => List.getSortersForQuery({
		sortersFromProp: unref(props?.sorters),
		sorters: unref(_sorters),
	}))
	const filtersForQuery = computed(() => List.getFiltersForQuery({
		filtersFromProp: unref(props?.filters),
		filters: unref(_filters),
	}))

	const listResult = useGetList<TData, TError, TResultData, TPageParam>({
		...props,
		resource: resourceName,
		pagination: paginationForQuery,
		sorters: sortersForQuery,
		filters: filtersForQuery,
	}, context)

	const pageCount = computed(() => List.getPageCount<TResultData, TPageParam>({
		queryData: unref(listResult.data),
		perPage: unref(perPage),
	}))

	const total = computed(() => unref(listResult.data)?.total)

	watchDebounced(() => ({
		syncRoute: unref(props?.syncRoute),
		currentPage: unref(currentPage),
		perPage: unref(perPage),
		sorters: unref(_sorters),
		filters: unref(_filters),
	}), (val) => {
		const params = List.toRouterGoParams(val)
		if (params)
			go(params)
	}, {
		flush: 'post',
		debounce: 50,
	})

	watchDebounced(resource, (val) => {
		if (
			(val?.params?.pagination) == null
			|| (val?.params?.filters) == null
			|| (val?.params?.sorters) == null
		)
			return

		currentPage.value = List.getInitialCurrentPage<TPageParam>({
			resource: unref(resource),
			syncRoute: unref(props?.syncRoute),
			paginationFromProp: unref(props?.pagination),
		})
		perPage.value = List.getInitialPerPage<TPageParam>({
			resource: unref(resource),
			syncRoute: unref(props?.syncRoute),
			paginationFromProp: unref(props?.pagination),
		})
		_sorters.value = List.getInitialSorters({
			resource: unref(resource),
			syncRoute: unref(props?.syncRoute),
			sortersFromProp: unref(props?.sorters),
		})
		_filters.value = List.getInitialFilters({
			resource: unref(resource),
			syncRoute: unref(props?.syncRoute),
			filtersFromProp: unref(props?.filters),
		})
	}, {
		flush: 'post',
		debounce: 50,
	})

	return {
		...listResult,

		currentPage,
		perPage,
		sorters: computed({
			get: () => unref(_sorters),
			set: setSorters,
		}),
		setSorters,
		filters: computed({
			get: () => unref(_filters),
			set: setFilters,
		}),
		setFilters,

		total,
		pageCount,
	}
}
