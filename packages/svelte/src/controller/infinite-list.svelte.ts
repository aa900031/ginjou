import type { BaseRecord, Filters, Sorters } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseGetInfiniteListContext, UseGetInfiniteListResult } from '../query'
import type { UseGoContext, UseLocationContext } from '../router'
import type { MaybeAccessor } from '../utils'
import type { UseResourceContext } from './resource.svelte'
import { InfiniteList, List, Resource } from '@ginjou/core'
import { useGetInfiniteList } from '../query'
import { useGo, useLocation } from '../router'
import { deriveState, extract, pickState, unbox, watch, withAccessors } from '../utils'
import { useResource } from './resource.svelte'

export type UseInfiniteListProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = MaybeAccessor<
	| InfiniteList.Props<TData, TError, TResultData, TPageParam>
	| undefined
>

export type UseInfiniteListContext = Simplify<
	& UseGetInfiniteListContext
	& UseResourceContext
	& UseGoContext
	& UseLocationContext
>

export type UseInfiniteListResult<
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = Simplify<
	& UseGetInfiniteListResult<TError, TResultData, TPageParam>
	& {
		currentPage: TPageParam
		perPage: number
		sorters: Sorters
		setSorters: List.SetSortersFn
		filters: Filters
		setFilters: List.SetFiltersFn

		readonly total: number | undefined
		readonly pageCount: number | undefined
	}
>

export function useInfiniteList<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
	TPageParam = number,
>(
	props?: UseInfiniteListProps<TData, TError, TResultData, TPageParam>,
	context?: UseInfiniteListContext,
): UseInfiniteListResult<TError, TResultData, TPageParam> {
	const resolvedProps = $derived(extract(props))
	const go = useGo(context)
	const resource = useResource(() => ({ name: resolvedProps?.resource }), context)
	const location = useLocation(context)

	const initialPageProp = pickState<TPageParam, InfiniteList.PaginationProp<TPageParam> | undefined>(
		() => resolvedProps?.pagination,
		List.getPropInitialPage,
	)
	const currentPageProp = pickState<TPageParam, InfiniteList.PaginationProp<TPageParam> | undefined>(
		() => resolvedProps?.pagination,
		List.getPropCurrentPage,
	)
	const perPageProp = pickState<number, InfiniteList.PaginationProp<TPageParam> | undefined>(
		() => resolvedProps?.pagination,
		List.getPropPerPage,
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

	const currentPageLocation = deriveState<TPageParam | undefined, List.GetLocationCurrentPageProps>(
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

	const currentPage = deriveState<TPageParam, List.GetCurrentPageProps<TPageParam>>(
		() => ({
			initalPageFromProp: unbox(initialPageProp),
			currentPageFromProp: unbox(currentPageProp),
			currentPageFromLocation: unbox(currentPageLocation),
			syncRouteFromProp: resolvedProps?.syncRoute,
		}),
		List.getCurrentPage,
	)
	const perPage = deriveState<number, List.GetPerPageProps<TPageParam>>(
		() => ({
			perPageFromProp: unbox(perPageProp),
			perPageFromLocation: unbox(perPageLocation),
			syncRouteFromProp: resolvedProps?.syncRoute,
		}),
		List.getPerPage,
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

	const paginationForQuery = $derived.by(() => InfiniteList.getPaginationForQuery({
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

	const result = useGetInfiniteList<TData, TError, TResultData, TPageParam>(() => ({
		...resolvedProps,
		resource: resourceName,
		fetcherName,
		pagination: paginationForQuery,
		sorters: sortersForQuery,
		filters: filtersForQuery,
	}), context)

	const pageCount = $derived.by(() => InfiniteList.getPageCount({
		queryData: result.data,
		perPage: unbox(perPage),
	}))

	const total = $derived.by(() => InfiniteList.getTotal({
		queryData: result.data,
	}))

	watch(() => ({
		syncRouteFromProp: resolvedProps?.syncRoute,

		perPageLocation: unbox(perPageLocation),
		filtersLocation: unbox(filtersLocation),
		sortersLocation: unbox(sortersLocation),

		perPage: unbox(perPage),
		sorters: unbox(sortersState),
		filters: unbox(filtersState),
	}), (val) => {
		const params = InfiniteList.toRouterGoParams(val)
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
		setSorters: () => setSorters,
		setFilters: () => setFilters,
	})
}
