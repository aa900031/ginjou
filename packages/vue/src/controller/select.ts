import type { BaseRecord, Pagination } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { ComputedRef, Ref } from 'vue-demi'
import type { UseGetListContext, UseGetListResult, UseGetManyByOneContext } from '../query'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseResourceContext } from './resource'
import { Resource, Select } from '@ginjou/core'
import { computed, ref, unref } from 'vue-demi'
import { useGetList, useGetManyByOne } from '../query'
import { pickRef } from '../utils/pick-ref'
import { useResource } from './resource'

export type UseSelectProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
	TValue = any,
	TSearchValue = string,
> = ToMaybeRefs<
	Select.Props<TData, TError, TResultData, TPageParam, TValue, TSearchValue>
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
	TValue = any,
	TSearchValue = string,
> = Simplify<
	& UseGetListResult<TError, TResultData, TPageParam> // TODO: merge GetManyResult
	& {
		options: ComputedRef<Select.OptionItem<TResultData, TValue>[] | undefined>
		search: Ref<TSearchValue | undefined>
		currentPage: Ref<TPageParam | undefined>
		perPage: Ref<number | undefined>
	}
>

export function useSelect<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
	TPageParam = number,
	TValue = any,
	TSearchValue = string,
>(
	props?: UseSelectProps<TData, TError, TResultData, TPageParam, TValue, TSearchValue>,
	context?: UseSelectContext,
): UseSelectResult<TError, TResultData, TPageParam, TValue, TSearchValue> {
	const resource = useResource({ name: props?.resource }, context)
	const search = ref<TSearchValue | undefined>() as Ref<TSearchValue | undefined>
	const currentPage = pickRef<TPageParam | undefined, Pagination<TPageParam> | undefined>(
		props?.pagination,
		Select.getPropCurrentPage,
	)
	const perPage = pickRef<number | undefined, Pagination<TPageParam> | undefined>(
		props?.pagination,
		Select.getPropPerPage,
	)

	const resourceName = computed(() => Resource.getName({
		resource: unref(resource),
		resourceFromProp: unref(props?.resource),
	}))
	const fetcherName = computed(() => Resource.getFetcherName({
		resource: unref(resource),
		fetcherNameFromProp: unref(props?.fetcherName),
	}))
	const filters = computed(() => Select.getListFilters({
		filterFormProp: unref(props?.filters),
		searchValue: unref(search),
		labelKey: unref(props?.labelKey),
		searchKey: unref(props?.searchKey),
		searchToFilters: unref(props?.searchToFilters),
	}))
	const pagination = computed(() => Select.getPagination({
		currentPage: unref(currentPage),
		perPage: unref(perPage),
	}))
	const ids = computed(() => Select.getValueIds({
		valueFormProp: unref(props?.value),
	}))

	const listResult = useGetList<TData, TError, TResultData, TPageParam>({
		...props,
		resource: resourceName,
		fetcherName,
		filters,
		pagination,
		queryOptions: props?.queryOptionsForOptions,
	}, context)

	const manyResult = useGetManyByOne<TData, TError, TResultData>({
		resource: resourceName,
		ids,
		fetcherName,
		queryOptions: props?.queryOptionsForValue,
		meta: props?.metaForValue,
	}, context)

	const options = computed(() => Select.getOptions({
		listData: unref(listResult.data),
		manyData: unref(manyResult.data),
		labelKey: unref(props?.labelKey),
		valueKey: unref(props?.valueKey),
		selectedOptionsOrder: unref(props?.selectedOptionsOrder),
	}))

	return {
		...listResult,
		options,
		search,
		currentPage,
		perPage,
	}
}
