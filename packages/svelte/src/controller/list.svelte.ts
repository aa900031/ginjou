import type { BaseRecord, Filters, Sorters } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseGetListContext, UseGetListResult } from '../query'
import type { UseGoContext, UseLocationContext } from '../router'
import type { MaybeAccessor } from '../utils'
import type { UseResourceContext } from './resource.svelte'
import { List, Resource } from '@ginjou/core'
import { useGetList } from '../query'
import { useGo, useLocation } from '../router'
import { deriveState, extract, pickState, unbox, watch, withAccessors } from '../utils'
import { useResource } from './resource.svelte'

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

	const initialPageProp = pickState<number, List.PaginationProp<number> | undefined>(
		() => resolvedProps?.pagination,
		List.getPropInitialPage,
	)
	const currentPageProp = pickState<number, List.PaginationProp<number> | undefined>(
		() => resolvedProps?.pagination,
		List.getPropCurrentPage,
	)
	const perPageProp = pickState<number, List.PaginationProp<number> | undefined>(
		() => resolvedProps?.pagination,
		List.getPropPerPage,
	)
	const paginationModeProp = pickState<List.PaginationProp<number>['mode'], List.PaginationProp<number> | undefined>(
		() => resolvedProps?.pagination,
		List.getPropPaginationMode,
	)
	const filtersProp = pickState<Filters, List.FiltersProp | undefined>(
		() => resolvedProps?.filters,
		List.getPropFilters,
	)
	const filtersPermanentProp = pickState<List.FiltersOptions['permanent'], List.FiltersProp | undefined>(
		() => resolvedProps?.filters,
		List.getPropFiltersPermanent,
	)
	const filtersBehaviorProp = pickState<List.FiltersOptions['behavior'], List.FiltersProp | undefined>(
		() => resolvedProps?.filters,
		List.getPropFiltersBehavior,
	)
	const filtersModeProp = pickState<List.FiltersOptions['mode'], List.FiltersProp | undefined>(
		() => resolvedProps?.filters,
		List.getPropFiltersMode,
	)
	const sortersProp = pickState<Sorters, List.SortersProp | undefined>(
		() => resolvedProps?.sorters,
		List.getPropSorters,
	)
	const sortersPermanentProp = pickState<List.SortersOptions['permanent'], List.SortersProp | undefined>(
		() => resolvedProps?.sorters,
		List.getPropSortersPermanent,
	)
	const sortersModeProp = pickState<List.SortersOptions['mode'], List.SortersProp | undefined>(
		() => resolvedProps?.sorters,
		List.getPropSortersMode,
	)

	const currentPageLocation = deriveState<number | undefined, List.GetLocationCurrentPageProps>(
		() => ({
			location: unbox(location),
			syncRouteFromProp: resolvedProps?.syncRoute,
		}),
		List.getLocationCurrentPage,
	)
	const perPageLocation = deriveState<number | undefined, List.GetLocationPerPageProps>(
		() => ({
			location: unbox(location),
			syncRouteFromProp: resolvedProps?.syncRoute,
		}),
		List.getLocationPerPage,
	)
	const filtersLocation = deriveState<Filters | undefined, List.GetLocationFiltersProps>(
		() => ({
			location: unbox(location),
			syncRouteFromProp: resolvedProps?.syncRoute,
		}),
		List.getLocationFilters,
	)
	const sortersLocation = deriveState<Sorters | undefined, List.GetLocationSortersProps>(
		() => ({
			location: unbox(location),
			syncRouteFromProp: resolvedProps?.syncRoute,
		}),
		List.getLocationSorters,
	)

	const resourceName = $derived.by(() => Resource.getName({
		resource: unbox(resource),
		resourceFromProp: resolvedProps?.resource,
	}))
	const fetcherName = $derived.by(() => Resource.getFetcherName({
		resource: unbox(resource),
		fetcherNameFromProp: resolvedProps?.fetcherName,
	}))

	const currentPage = deriveState<number, List.GetCurrentPageProps<number>>(
		() => ({
			initalPageFromProp: unbox(initialPageProp),
			currentPageFromProp: unbox(currentPageProp),
			currentPageFromLocation: unbox(currentPageLocation),
			syncRouteFromProp: resolvedProps?.syncRoute,
		}),
		List.getCurrentPage<number>,
	)
	const perPage = deriveState<number, List.GetPerPageProps<number>>(
		() => ({
			perPageFromProp: unbox(perPageProp),
			perPageFromLocation: unbox(perPageLocation),
			syncRouteFromProp: resolvedProps?.syncRoute,
		}),
		List.getPerPage<number>,
	)
	const filtersState = deriveState<Filters, List.GetFiltersProps>(
		() => ({
			filtersFromLocation: unbox(filtersLocation),
			filtersFromProp: unbox(filtersProp),
			filtersPermanentFromProp: unbox(filtersPermanentProp),
			syncRouteFromProp: resolvedProps?.syncRoute,
		}),
		List.getFilters,
	)
	const setFilters = List.createSetFiltersFn({
		getFiltersPermanent: () => unbox(filtersPermanentProp),
		getFiltersBehavior: () => unbox(filtersBehaviorProp),
		getPrev: () => unbox(filtersState),
		update: (value: Filters) => filtersState.value = value,
	})
	const sortersState = deriveState<Sorters, List.GetSortersProps>(
		() => ({
			sortersFromLocation: unbox(sortersLocation),
			sortersFromProp: unbox(sortersProp),
			sortersPermanentFromProp: unbox(sortersPermanentProp),
			syncRouteFromProp: resolvedProps?.syncRoute,
		}),
		List.getSorters,
	)
	const setSorters = List.createSetSortersFn({
		getSortersPermanent: () => unbox(sortersPermanentProp),
		getPrev: () => unbox(sortersState),
		update: (value: Sorters) => sortersState.value = value,
	})

	const paginationForQuery = $derived.by(() => List.getPaginationForQuery({
		paginationModeFromProp: unbox(paginationModeProp),
		currentPage: unbox(currentPage),
		perPage: unbox(perPage),
	}))
	const sortersForQuery = $derived.by(() => List.getSortersForQuery({
		sortersModeFromProp: unbox(sortersModeProp),
		sorters: unbox(sortersState),
	}))
	const filtersForQuery = $derived.by(() => List.getFiltersForQuery({
		filtersModeFromProp: unbox(filtersModeProp),
		filters: unbox(filtersState),
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
		perPage: unbox(perPage),
	}))
	const records = $derived.by(() => List.getRecords({
		paginationModeFromProp: unbox(paginationModeProp),
		currentPage: unbox(currentPage),
		perPage: unbox(perPage),
		queryData: result.data,
	}))
	const total = $derived.by(() => List.getTotal({
		queryData: result.data,
	}))

	watch(() => ({
		syncRouteFromProp: resolvedProps?.syncRoute,

		currentPageLocation: unbox(currentPageLocation),
		perPageLocation: unbox(perPageLocation),
		filtersLocation: unbox(filtersLocation),
		sortersLocation: unbox(sortersLocation),

		currentPage: unbox(currentPage),
		perPage: unbox(perPage),
		sorters: unbox(sortersState),
		filters: unbox(filtersState),
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
		perPage: unbox(perPage),
		_filters: unbox(filtersState),
		_sorters: unbox(sortersState),
	}), () => {
		currentPage.value = List.getInitialPage({
			initalPageFromProp: unbox(initialPageProp),
		})
	})

	return withAccessors(result, {
		currentPage: { get: () => currentPage.value, set: v => (currentPage.value = v) },
		perPage: { get: () => perPage.value, set: v => (perPage.value = v) },
		sorters: { get: () => sortersState.value, set: v => setSorters(v) },
		filters: { get: () => filtersState.value, set: v => setFilters(v, List.SetFilterBehavior.Replace) },
		total: () => total,
		pageCount: () => pageCount,
		records: () => records,
		setSorters: () => setSorters,
		setFilters: () => setFilters,
	})
}
