import type { BaseRecord, Filters, Sorters } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseGetListContext, UseGetListResult } from '../query'
import type { UseResourceContext } from '../resource'
import type { UseGoContext, UseLocationContext } from '../router'
import type { MaybeAccessor } from '../utils'
import { getFetcherName, getResourceIdentifier, List } from '@ginjou/core'
import { useGetList } from '../query'
import { useResource } from '../resource'
import { useGo, useLocation } from '../router'
import { extract, stateFallback, stateSub, watch } from '../utils'

export type UseListProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = MaybeAccessor<
	| List.Props<TData, TError, TResultData, number>
	| undefined
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
		currentPage: number
		perPage: number
		sorters: Sorters
		setSorters: List.SetSortersFn
		filters: Filters
		setFilters: List.SetFiltersFn

		readonly total: number | undefined
		readonly pageCount: number | undefined
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
	const resolvedProps = $derived(extract(props))
	const go = useGo(context)
	const resource = useResource(() => ({ name: resolvedProps?.resource }), context)
	const location = useLocation(context)

	const initialPageProp = stateSub<number, List.PaginationProp<number> | undefined>(
		() => resolvedProps?.pagination,
		List.getPropInitialPage,
	)
	const currentPageProp = stateSub<number, List.PaginationProp<number> | undefined>(
		() => resolvedProps?.pagination,
		List.getPropCurrentPage,
	)
	const perPageProp = stateSub<number, List.PaginationProp<number> | undefined>(
		() => resolvedProps?.pagination,
		List.getPropPerPage,
	)
	const paginationModeProp = stateSub<List.PaginationProp<number>['mode'], List.PaginationProp<number> | undefined>(
		() => resolvedProps?.pagination,
		List.getPropPaginationMode,
	)
	const filtersProp = stateSub<Filters, List.FiltersProp | undefined>(
		() => resolvedProps?.filters,
		List.getPropFilters,
	)
	const filtersPermanentProp = stateSub<List.FiltersOptions['permanent'], List.FiltersProp | undefined>(
		() => resolvedProps?.filters,
		List.getPropFiltersPermanent,
	)
	const filtersBehaviorProp = stateSub<List.FiltersOptions['behavior'], List.FiltersProp | undefined>(
		() => resolvedProps?.filters,
		List.getPropFiltersBehavior,
	)
	const filtersModeProp = stateSub<List.FiltersOptions['mode'], List.FiltersProp | undefined>(
		() => resolvedProps?.filters,
		List.getPropFiltersMode,
	)
	const sortersProp = stateSub<Sorters, List.SortersProp | undefined>(
		() => resolvedProps?.sorters,
		List.getPropSorters,
	)
	const sortersPermanentProp = stateSub<List.SortersOptions['permanent'], List.SortersProp | undefined>(
		() => resolvedProps?.sorters,
		List.getPropSortersPermanent,
	)
	const sortersModeProp = stateSub<List.SortersOptions['mode'], List.SortersProp | undefined>(
		() => resolvedProps?.sorters,
		List.getPropSortersMode,
	)

	const currentPageLocation = stateFallback<number | undefined, List.GetLocationCurrentPageProps>(
		() => ({
			location: location.value,
			syncRouteFromProp: resolvedProps?.syncRoute,
		}),
		List.getLocationCurrentPage,
	)
	const perPageLocation = stateFallback<number | undefined, List.GetLocationPerPageProps>(
		() => ({
			location: location.value,
			syncRouteFromProp: resolvedProps?.syncRoute,
		}),
		List.getLocationPerPage,
	)
	const filtersLocation = stateFallback<Filters | undefined, List.GetLocationFiltersProps>(
		() => ({
			location: location.value,
			syncRouteFromProp: resolvedProps?.syncRoute,
		}),
		List.getLocationFilters,
	)
	const sortersLocation = stateFallback<Sorters | undefined, List.GetLocationSortersProps>(
		() => ({
			location: location.value,
			syncRouteFromProp: resolvedProps?.syncRoute,
		}),
		List.getLocationSorters,
	)

	const resourceName = $derived.by(() => getResourceIdentifier({
		resource: resource.value,
		resourceFromProp: resolvedProps?.resource,
	}))
	const fetcherName = $derived.by(() => getFetcherName({
		resource: resource.value,
		fetcherNameFromProp: resolvedProps?.fetcherName,
	}))

	const currentPage = stateFallback(
		() => ({
			initalPageFromProp: initialPageProp.value,
			currentPageFromProp: currentPageProp.value,
			currentPageFromLocation: currentPageLocation.value,
			syncRouteFromProp: resolvedProps?.syncRoute,
		}),
		List.getCurrentPage<number>,
	)
	const perPage = stateFallback(
		() => ({
			perPageFromProp: perPageProp.value,
			perPageFromLocation: perPageLocation.value,
			syncRouteFromProp: resolvedProps?.syncRoute,
		}),
		List.getPerPage<number>,
	)
	const filtersState = stateFallback<Filters, List.GetFiltersProps>(
		() => ({
			filtersFromLocation: filtersLocation.value,
			filtersFromProp: filtersProp.value,
			filtersPermanentFromProp: filtersPermanentProp.value,
			syncRouteFromProp: resolvedProps?.syncRoute,
		}),
		List.getFilters,
	)
	const setFilters = List.createSetFiltersFn({
		getFiltersPermanent: () => filtersPermanentProp.value,
		getFiltersBehavior: () => filtersBehaviorProp.value,
		getPrev: () => filtersState.value,
		update: value => filtersState.value = value,
	})
	const sortersState = stateFallback<Sorters, List.GetSortersProps>(
		() => ({
			sortersFromLocation: sortersLocation.value,
			sortersFromProp: sortersProp.value,
			sortersPermanentFromProp: sortersPermanentProp.value,
			syncRouteFromProp: resolvedProps?.syncRoute,
		}),
		List.getSorters,
	)
	const setSorters = List.createSetSortersFn({
		getSortersPermanent: () => sortersPermanentProp.value,
		getPrev: () => sortersState.value,
		update: value => sortersState.value = value,
	})

	const paginationForQuery = $derived.by(() => List.getPaginationForQuery({
		paginationModeFromProp: paginationModeProp.value,
		currentPage: currentPage.value,
		perPage: perPage.value,
	}))
	const sortersForQuery = $derived.by(() => List.getSortersForQuery({
		sortersModeFromProp: sortersModeProp.value,
		sorters: sortersState.value,
	}))
	const filtersForQuery = $derived.by(() => List.getFiltersForQuery({
		filtersModeFromProp: filtersModeProp.value,
		filters: filtersState.value,
	}))

	const result = useGetList<TData, TError, TResultData, number>(() => ({
		...resolvedProps,
		resource: resourceName,
		fetcherName,
		pagination: paginationForQuery,
		sorters: sortersForQuery,
		filters: filtersForQuery,
	}), context)

	const pageCount = $derived.by(() => List.getPageCount({
		queryData: result.data,
		perPage: perPage.value,
	}))
	const records = $derived.by(() => List.getRecords({
		paginationModeFromProp: paginationModeProp.value,
		currentPage: currentPage.value,
		perPage: perPage.value,
		queryData: result.data,
	}))
	const total = $derived.by(() => List.getTotal({
		queryData: result.data,
	}))

	watch(() => ({
		syncRouteFromProp: resolvedProps?.syncRoute,

		currentPageLocation: currentPageLocation.value,
		perPageLocation: perPageLocation.value,
		filtersLocation: filtersLocation.value,
		sortersLocation: sortersLocation.value,

		currentPage: currentPage.value,
		perPage: perPage.value,
		sorters: sortersState.value,
		filters: filtersState.value,
	}), (val) => {
		const params = List.toRouterGoParams(val)
		if (!params)
			return

		const timer = setTimeout(() => {
			go(params)
		}, 100)

		return () => {
			clearTimeout(timer)
		}
	}, {
		flush: 'post',
		immediate: true,
	})

	watch(() => ({
		perPage: perPage.value,
		_filters: filtersState.value,
		_sorters: sortersState.value,
	}), () => {
		currentPage.value = List.getInitialPage({
			initalPageFromProp: initialPageProp.value,
		})
	})

	Object.assign(result, {
		get currentPage() {
			return currentPage.value
		},
		set currentPage(value) {
			currentPage.value = value
		},
		get perPage() {
			return perPage.value
		},
		set perPage(value) {
			perPage.value = value
		},
		get sorters() {
			return sortersState.value
		},
		set sorters(value) {
			setSorters(value)
		},
		get filters() {
			return filtersState.value
		},
		set filters(value) {
			setFilters(value, List.SetFilterBehavior.Replace)
		},
		get total() {
			return total
		},
		get pageCount() {
			return pageCount
		},
		get records() {
			return records
		},
		setSorters,
		setFilters,
	})

	return result as UseListResult<TError, TResultData>
}
