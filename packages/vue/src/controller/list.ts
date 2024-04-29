import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import { computed, unref, watch } from 'vue-demi'
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
> = ToMaybeRefs<
	List.Props<TData, TError, TResultData>
>

export type UseListContext = Simplify<
	& UseGetListContext
	& UseResourceContext
	& UseGoContext
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

	const currentPageProp = refSub(
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

	const currentPageResource = refSub(
		resource,
		List.getResourceCurrentPage,
	)
	const perPageResource = refSub(
		resource,
		List.getResourcePerPage,
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
		() => ({
			currentPageFromProp: unref(currentPageProp),
			currentPageFromResource: unref(currentPageResource),
			syncRouteFromProp: unref(props?.syncRoute),
		}),
		List.getCurrentPage,
	)
	const perPage = refFallback(
		() => ({
			perPageFromProp: unref(perPageProp),
			perPageFromResource: unref(perPageResource),
			syncRouteFromProp: unref(props?.syncRoute),
		}),
		List.getPerPage,
	)
	const _filters = refFallback(
		() => ({
			filtersFromResource: unref(filtersResource),
			filtersFromProp: unref(filtersProp),
			filtersPermanentFromProp: unref(filtersPermanentProp),
			syncRouteFromProp: unref(props?.syncRoute),
		}),
		List.getFilters,
	)
	const setFilters = List.createSetFiltersFn({
		getFiltersPermanent: () => unref(filtersPermanentProp),
		getFiltersBehavior: () => unref(filtersBehaviorProp),
		update: getter => _filters.value = getter(unref(_filters)),
	})
	const _sorters = refFallback(
		() => ({
			sortersFromResource: unref(sortersResource),
			sortersFromProp: unref(sortersProp),
			sortersPermanentFromProp: unref(sortersPermanentProp),
			syncRouteFromProp: unref(props?.syncRoute),
		}),
		List.getSorters,
	)
	const setSorters = List.createSetSortersFn({
		getSortersPermanent: () => unref(sortersPermanentProp),
		update: getter => _sorters.value = getter(unref(_sorters)),
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

	const listResult = useGetList<TData, TError, TResultData, number>({
		...props,
		resource: resourceName,
		fetcherName,
		pagination: paginationForQuery,
		sorters: sortersForQuery,
		filters: filtersForQuery,
	}, context)

	const pageCount = computed(() => List.getPageCount<TResultData>({
		queryData: unref(listResult.data),
		perPage: unref(perPage),
	}))

	const records = computed(() => List.getRecords<TResultData>({
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
		immediate: true,
	})

	watch(() => ({
		perPage: unref(perPage),
		_filters: unref(_filters),
		_sorters: unref(_sorters),
	}), () => {
		currentPage.value = 1
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
