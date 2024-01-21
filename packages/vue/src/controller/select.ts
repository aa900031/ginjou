import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import { computed, ref, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import type { BaseRecord, Filters } from '@ginjou/core'
import { Select } from '@ginjou/core'
import type { UseGetListContext, UseGetListProps, UseGetListResult, UseGetManyContext, UseGetManyProps } from '../query'
import { useGetList, useGetMany } from '../query'
import type { UseResourceContext } from '../resource'
import { useResource } from '../resource'

export type UseSelectProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = Simplify<
	& Omit<
			UseGetListProps<TData, TError, TResultData, TPageParam>,
			| 'queryOptions'
		>
	& {
		labelKey?: MaybeRef<string>
		valueKey?: MaybeRef<string>
		value?: MaybeRef<any | any[]>
		searchToFilters?: Select.SearchToFiltersFn<string> // TODO: TSearchValue from generic
		queryOptionsForOptions?: UseGetListProps<TData, TError, TResultData, TPageParam>['queryOptions']
		queryOptionsForValue?: UseGetManyProps<TData, TError, TResultData>['queryOptions']
	}
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
	& UseGetListResult<TError, TResultData, TPageParam> // TODO: merge GetManyResult
	& {
		options: Ref<Select.OptionItem<TResultData, string, string>[] | undefined>
		setSearch: Select.SetSearchFn<string> // TODO: TSearchValue from generic
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
	const resource = useResource({ name: props?.resource }, context)
	const searchFilters = ref<Filters | undefined>()

	const resourceName = computed(() => unref(resource)?.resource.name)
	const filters = computed(() => Select.getListFilters({
		filterFormProp: unref(props?.filters),
		searchFilters: unref(searchFilters),
	}))
	const ids = computed(() => Select.getValueIds({
		valueFormProp: unref(props?.value),
	}))

	const listResult = useGetList<TData, TError, TResultData, TPageParam>({
		...props,
		resource: resourceName,
		filters,
		queryOptions: props?.queryOptionsForOptions,
	})

	const manyResult = useGetMany<TData, TError, TResultData>({
		resource: resourceName,
		ids,
		queryOptions: props?.queryOptionsForValue,
		fetcherName: props?.fetcherName,
		meta: props?.meta,
	})

	const options = computed(() => Select.getOptions({
		listData: unref(listResult.data),
		manyData: unref(manyResult.data),
		labelKey: unref(props?.labelKey) ?? 'title',
		valueKey: unref(props?.valueKey) ?? 'id',
	}))

	const setSearch = Select.createSetSearchFn<string>({
		getLabelKey: () => unref(props?.labelKey) ?? 'title',
		searchToFilters: props?.searchToFilters,
		update: value => searchFilters.value = value,
	})

	return {
		...listResult,
		options,
		setSearch,
	}
}
