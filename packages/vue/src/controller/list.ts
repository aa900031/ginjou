import type { BaseRecord, Filters, Sorters } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import type { UseGetListContext, UseGetListResult } from '../query'
import type { UseResourceContext } from '../resource'
import type { UseGoContext, UseLocationContext } from '../router'
import type { ToMaybeRefs } from '../utils/refs'
import { getFetcherName, getResourceIdentifier, List } from '@ginjou/core'
import { watchDebounced } from '@vueuse/shared'
import { computed, unref, watch } from 'vue-demi'
import { useGetList } from '../query'
import { useResource } from '../resource'
import { useGo, useLocation } from '../router'
import { refFallback } from '../utils/ref-fallback'
import { refSub } from '../utils/ref-sub'

export type UseListProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = ToMaybeRefs<
	List.Props<TData, TError, TResultData, number>
>

export type UseListContext = Simplify<
	& UseGetListContext
	& UseResourceContext
	& UseGoContext
	& UseLocationContext
>

export type UseListResult<
	TError,
	TResultData extends BaseRecord,
> = Simplify<
	& UseGetListResult<TError, TResultData, number>
	& {
		currentPage: Ref<number>
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
>(
	props?: UseListProps<TData, TError, TResultData>,
	context?: UseListContext,
): UseListResult<TError, TResultData> {
	const go = useGo(context)
	const resource = useResource({ name: props?.resource }, context)
	const location = useLocation(context)

	const initalPageProp = refSub<number, any>(
		props?.pagination,
		List.getPropInitialPage,
	)
	const currentPageProp = refSub<number, any>(
		props?.pagination,
		List.getPropCurrentPage,
	)
	const perPageProp = refSub(
		props?.pagination,
		List.getPropPerPage,
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

	const currentPageLocation = computed<number | undefined>(() => List.getLocationCurrentPage({
		location: unref(location),
		syncRouteFromProp: unref(props?.syncRoute),
	}))
	const perPageLocation = computed(() => List.getLocationPerPage({
		location: unref(location),
		syncRouteFromProp: unref(props?.syncRoute),
	}))
	const filtersLocation = computed(() => List.getLocationFilters({
		location: unref(location),
		syncRouteFromProp: unref(props?.syncRoute),
	}))
	const sortersLocation = computed(() => List.getLocationSorters({
		location: unref(location),
		syncRouteFromProp: unref(props?.syncRoute),
	}))

	const resourceName = computed(() => getResourceIdentifier({
		resource: unref(resource),
		resourceFromProp: unref(props?.resource),
	}))
	const fetcherName = computed(() => getFetcherName({
		resource: unref(resource),
		fetcherNameFromProp: unref(props?.fetcherName),
	}))

	const currentPage = refFallback<number, any>(
		() => ({
			initalPageFromProp: unref(initalPageProp),
			currentPageFromProp: unref(currentPageProp),
			currentPageFromLocation: unref(currentPageLocation),
			syncRouteFromProp: unref(props?.syncRoute),
		}),
		List.getCurrentPage,
	)
	const perPage = refFallback(
		() => ({
			perPageFromProp: unref(perPageProp),
			perPageFromLocation: unref(perPageLocation),
			syncRouteFromProp: unref(props?.syncRoute),
		}),
		List.getPerPage,
	)
	const _filters = refFallback(
		() => ({
			filtersFromLocation: unref(filtersLocation),
			filtersFromProp: unref(filtersProp),
			filtersPermanentFromProp: unref(filtersPermanentProp),
			syncRouteFromProp: unref(props?.syncRoute),
		}),
		List.getFilters,
	)
	const setFilters = List.createSetFiltersFn({
		getFiltersPermanent: () => unref(filtersPermanentProp),
		getFiltersBehavior: () => unref(filtersBehaviorProp),
		getPrev: () => unref(_filters),
		update: value => _filters.value = value,
	})
	const _sorters = refFallback(
		() => ({
			sortersFromLocation: unref(sortersLocation),
			sortersFromProp: unref(sortersProp),
			sortersPermanentFromProp: unref(sortersPermanentProp),
			syncRouteFromProp: unref(props?.syncRoute),
		}),
		List.getSorters,
	)
	const setSorters = List.createSetSortersFn({
		getSortersPermanent: () => unref(sortersPermanentProp),
		getPrev: () => unref(_sorters),
		update: value => _sorters.value = value,
	})

	const paginationForQuery = computed(() => List.getPaginationForQuery({
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

	const listResult = useGetList<TData, TError, TResultData>({
		...props,
		resource: resourceName,
		fetcherName,
		pagination: paginationForQuery,
		sorters: sortersForQuery,
		filters: filtersForQuery,
	}, context)

	const pageCount = computed(() => List.getPageCount({
		queryData: unref(listResult.data),
		perPage: unref(perPage),
	}))

	const records = computed(() => List.getRecords({
		paginationModeFromProp: unref(paginationModeProp),
		currentPage: unref(currentPage),
		perPage: unref(perPage),
		queryData: unref(listResult.data),
	}))

	const total = computed(() => List.getTotal({
		queryData: unref(listResult.data),
	}))

	watchDebounced(() => ({
		syncRouteFromProp: unref(props?.syncRoute),

		currentPageLocation: unref(currentPageLocation),
		perPageLocation: unref(perPageLocation),
		filtersLocation: unref(filtersLocation),
		sortersLocation: unref(sortersLocation),

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
		immediate: true,
	})

	watch(() => ({
		perPage: unref(perPage),
		_filters: unref(_filters),
		_sorters: unref(_sorters),
	}), () => {
		currentPage.value = List.getInitialPage({
			initalPageFromProp: unref(initalPageProp),
		})
	}, {
		flush: 'sync',
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
			set: val => setFilters(val, List.SetFilterBehavior.Replace),
		}),
		setFilters,

		records,
		total,
		pageCount,
	}
}
