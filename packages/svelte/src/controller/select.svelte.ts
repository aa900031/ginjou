import type { BaseRecord, RecordKey } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseGetListContext, UseGetListResult, UseGetManyByOneContext } from '../query'
import type { MaybeAccessor } from '../utils'
import type { UseResourceContext } from './resource.svelte'
import { Resource, Select } from '@ginjou/core'
import { useGetList, useGetManyByOne } from '../query'
import { extract, pickState, unbox, withAccessors } from '../utils'
import { useResource } from './resource.svelte'

export type UseSelectProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
	TValue extends RecordKey = RecordKey,
	TSearchValue = string,
> = MaybeAccessor<
	| Select.Props<TData, TError, TResultData, TPageParam, TValue, TSearchValue>
	| undefined
>

export type UseSelectContext = Simplify<
	& UseGetListContext
	& UseGetManyByOneContext
	& UseResourceContext
>

export type UseSelectResult<
	TError,
	TResultData extends BaseRecord,
	TPageParam,
	TValue extends RecordKey = RecordKey,
	TSearchValue = string,
> = Simplify<
	& UseGetListResult<TError, TResultData, TPageParam>
	& {
		readonly options: Select.OptionItem<TResultData, TValue>[] | undefined
		search: TSearchValue | undefined
		currentPage: TPageParam | undefined
		perPage: number | undefined
	}
>

export function useSelect<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
	TPageParam = number,
	TValue extends RecordKey = RecordKey,
	TSearchValue = string,
>(
	props?: UseSelectProps<TData, TError, TResultData, TPageParam, TValue, TSearchValue>,
	context?: UseSelectContext,
): UseSelectResult<TError, TResultData, TPageParam, TValue, TSearchValue> {
	const resolvedProps = $derived(extract(props))
	const resource = useResource(() => ({ name: resolvedProps?.resource }), context)

	let search = $state.raw<TSearchValue | undefined>()
	const currentPage = pickState<TPageParam | undefined, Select.Props<TData, TError, TResultData, TPageParam, TValue, TSearchValue>['pagination']>(
		() => resolvedProps?.pagination,
		Select.getPropCurrentPage,
	)
	const perPage = pickState<number | undefined, Select.Props<TData, TError, TResultData, TPageParam, TValue, TSearchValue>['pagination']>(
		() => resolvedProps?.pagination,
		Select.getPropPerPage,
	)

	const resourceName = $derived.by(() => Resource.getName({
		resource: unbox(resource),
		resourceFromProp: resolvedProps?.resource,
	}))
	const fetcherName = $derived.by(() => Resource.getFetcherName({
		resource: unbox(resource),
		fetcherNameFromProp: resolvedProps?.fetcherName,
	}))
	const filters = $derived.by(() => Select.getListFilters({
		filterFormProp: resolvedProps?.filters,
		searchValue: search,
		labelKey: resolvedProps?.labelKey,
		searchKey: resolvedProps?.searchKey,
		searchToFilters: resolvedProps?.searchToFilters,
	}))
	const pagination = $derived.by(() => Select.getPagination({
		currentPage: unbox(currentPage),
		perPage: unbox(perPage),
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

	const manyResult = useGetManyByOne<TData, TError, TResultData>(() => ({
		resource: resourceName,
		ids,
		fetcherName,
		queryOptions: resolvedProps?.queryOptionsForValue,
		meta: resolvedProps?.metaForValue,
	}), context)

	const options = $derived.by(() => Select.getOptions({
		listData: listResult.data,
		manyData: manyResult.data,
		labelKey: resolvedProps?.labelKey,
		valueKey: resolvedProps?.valueKey,
		selectedOptionsOrder: resolvedProps?.selectedOptionsOrder,
	}))

	return withAccessors(listResult, {
		options: () => options,
		search: { get: () => search, set: v => (search = v) },
		currentPage: { get: () => currentPage.value, set: v => (currentPage.value = v) },
		perPage: { get: () => perPage.value, set: v => (perPage.value = v) },
	})
}
