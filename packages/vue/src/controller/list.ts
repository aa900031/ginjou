import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import { watchDebounced } from '@vueuse/shared'
import type { BaseRecord, Filters, Sorters } from '@ginjou/core'
import { List, getFetcherName, getResourceIdentifier } from '@ginjou/core'
import { useGetList } from '../query'
import type { UseGetListContext, UseGetListResult } from '../query'
import type { UseResourceContext } from '../resource'
import { useResource } from '../resource'
import type { UseGoContext } from '../router'
import { useGo } from '../router'
import type { ToMaybeRefs } from '../utils/refs'
import { refSub } from '../utils/ref-sub'
import { refFallback } from '../utils/ref-fallback'

export type UseListProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = ToMaybeRefs<
	List.Props<TData, TError, TResultData, TPageParam>
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

	const currentPageProp = refSub(
		props?.pagination,
		List.getPropCurrentPage<TPageParam>,
	)
	const perPageProp = refSub(
		props?.pagination,
		List.getPropPerPage<TPageParam>,
	)
	const paginationModeProp = refSub(
		props?.pagination,
		List.getPropPaginationMode,
	)
	const filtersProp = refSub(
		props?.filters,
		List.getPropFilters,
	)
	const filtersPermanentProp = refSub(
		props?.filters,
		List.getPropFiltersPermanent,
	)
	const filtersBehaviorProp = refSub(
		props?.filters,
		List.getPropFiltersBehavior,
	)
	const filtersModeProp = refSub(
		props?.filters,
		List.getPropFiltersMode,
	)
	const sortersProp = refSub(
		props?.sorters,
		List.getPropSorters,
	)
	const sortersPermanentProp = refSub(
		props?.sorters,
		List.getPropSortersPermanent,
	)
	const sortersModeProp = refSub(
		props?.sorters,
		List.getPropSortersMode,
	)

	const currentPageResource = refSub(
		resource,
		List.getResourceCurrentPage<TPageParam>,
	)
	const perPageResource = refSub(
		resource,
		List.getResourcePerPage<TPageParam>,
	)
	const filtersResource = refSub(
		resource,
		List.getResourceFilters,
	)
	const sortersResource = refSub(
		resource,
		List.getResourceSorters,
	)

	const resourceName = computed(() => getResourceIdentifier({
		resource: unref(resource),
		resourceFromProp: unref(props?.resource),
	}))
	const fetcherName = computed(() => getFetcherName({
		resource: unref(resource),
		fetcherNameFromProp: unref(props?.fetcherName),
	}))

	const currentPage = refFallback(
		() => List.getCurrentPage<TPageParam>({
			currentPageFromProp: unref(currentPageProp),
			currentPageFromResource: unref(currentPageResource),
			syncRouteFromProp: unref(props?.syncRoute),
		}),
	)
	const perPage = refFallback(
		() => List.getPerPage<TPageParam>({
			perPageFromProp: unref(perPageProp),
			perPageFromResource: unref(perPageResource),
			syncRouteFromProp: unref(props?.syncRoute),
		}),
	)
	const _filters = refFallback(
		() => List.getFilters({
			filtersFromResource: unref(filtersResource),
			filtersFromProp: unref(filtersProp),
			filtersPermanentFromProp: unref(filtersPermanentProp),
			syncRouteFromProp: unref(props?.syncRoute),
		}),
	)
	const setFilters = List.createSetFiltersFn({
		getFiltersPermanent: () => unref(filtersPermanentProp),
		getFiltersBehavior: () => unref(filtersBehaviorProp),
		update: getter => _filters.value = getter(unref(_filters)),
	})
	const _sorters = refFallback(
		() => List.getSorters({
			sortersFromResource: unref(sortersResource),
			sortersFromProp: unref(sortersProp),
			sortersPermanentFromProp: unref(sortersPermanentProp),
			syncRouteFromProp: unref(props?.syncRoute),
		}),
	)
	const setSorters = List.createSetSortersFn({
		getSortersPermanent: () => unref(sortersPermanentProp),
		update: getter => _sorters.value = getter(unref(_sorters)),
	})

	const paginationForQuery = computed(() => List.getPaginationForQuery<TPageParam>({
		paginationModeFromProp: unref(paginationModeProp),
		currentPage: unref(currentPage),
		perPage: unref(perPage),
	}))
	const sortersForQuery = computed(() => List.getSortersForQuery({
		sortersModeFromProp: unref(sortersModeProp),
		sorters: unref(_sorters),
	}))
	const filtersForQuery = computed(() => List.getFiltersForQuery({
		filtersModeFromProp: unref(filtersModeProp),
		filters: unref(_filters),
	}))

	const listResult = useGetList<TData, TError, TResultData, TPageParam>({
		...props,
		resource: resourceName,
		fetcherName,
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
		syncRouteFromProp: unref(props?.syncRoute),

		currentPageResource: unref(currentPageResource),
		perPageResource: unref(perPageResource),
		sortersResource: unref(sortersResource),
		filtersResource: unref(filtersResource),

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
		debounce: 100,
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
