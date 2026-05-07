import type { BaseRecord } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseGetListContext, UseGetListResult, UseGetManyContext } from '../query'
import type { UseResourceContext } from '../resource'
import type { MaybeAccessor } from '../utils'
import { getFetcherName, getResourceIdentifier, Select } from '@ginjou/core'
import { useGetList, useGetMany } from '../query'
import { useResource } from '../resource'
import { extract, stateSub } from '../utils'

export type UseSelectProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = MaybeAccessor<
	| Select.Props<TData, TError, TResultData, TPageParam>
	| undefined
>

export type UseSelectContext = Simplify<
	& UseGetListContext
	& UseGetManyContext
	& UseResourceContext
>

export type UseSelectResult<
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = Simplify<
	& UseGetListResult<TError, TResultData, TPageParam>
	& {
		readonly options: Select.OptionItem<TResultData>[] | undefined
		search: string | undefined
		currentPage: TPageParam | undefined
		perPage: number | undefined
	}
>

export function useSelect<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
	TPageParam = number,
>(
	props?: UseSelectProps<TData, TError, TResultData, TPageParam>,
	context?: UseSelectContext,
): UseSelectResult<TError, TResultData, TPageParam> {
	const resolvedProps = $derived(extract(props))
	const resource = useResource(() => ({ name: resolvedProps?.resource }), context)

	let search = $state<string | undefined>()
	const currentPage = stateSub<TPageParam | undefined, Select.Props<TData, TError, TResultData, TPageParam>['pagination']>(
		() => resolvedProps?.pagination,
		Select.getPropCurrentPage,
	)
	const perPage = stateSub<number | undefined, Select.Props<TData, TError, TResultData, TPageParam>['pagination']>(
		() => resolvedProps?.pagination,
		Select.getPropPerPage,
	)

	const resourceName = $derived.by(() => getResourceIdentifier({
		resource: resource.value,
		resourceFromProp: resolvedProps?.resource,
	}))
	const fetcherName = $derived.by(() => getFetcherName({
		resource: resource.value,
		fetcherNameFromProp: resolvedProps?.fetcherName,
	}))
	const filters = $derived.by(() => Select.getListFilters({
		filterFormProp: resolvedProps?.filters,
		searchValue: search,
		labelKey: resolvedProps?.labelKey,
		searchToFilters: resolvedProps?.searchToFilters,
	}))
	const pagination = $derived.by(() => Select.getPagination({
		currentPage: currentPage.value,
		perPage: perPage.value,
	}))
	const ids = $derived.by(() => Select.getValueIds({
		valueFormProp: resolvedProps?.value,
	}))

	const listResult = useGetList<TData, TError, TResultData, TPageParam>(() => ({
		...resolvedProps,
		resource: resourceName,
		fetcherName,
		filters,
		pagination,
		queryOptions: resolvedProps?.queryOptionsForOptions,
	}), context)

	const manyResult = useGetMany<TData, TError, TResultData>(() => ({
		resource: resourceName,
		ids,
		fetcherName,
		queryOptions: resolvedProps?.queryOptionsForValue,
		meta: resolvedProps?.meta,
	}), context)

	const options = $derived.by(() => Select.getOptions({
		listData: listResult.data,
		manyData: manyResult.data,
		labelKey: resolvedProps?.labelKey,
		valueKey: resolvedProps?.valueKey,
	}))

	Object.assign(listResult, {
		get options() {
			return options
		},
		get search() {
			return search
		},
		set search(value) {
			search = value
		},
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
	})

	return listResult as UseSelectResult<TError, TResultData, TPageParam>
}
