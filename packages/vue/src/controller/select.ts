import type { Simplify } from 'type-fest'
import type { ComputedRef, Ref } from 'vue-demi'
import { computed, ref, unref } from 'vue-demi'
import type { BaseRecord } from '@ginjou/core'
import { Select, getFetcherName, getResourceIdentifier } from '@ginjou/core'
import type { UseGetListContext, UseGetListResult, UseGetManyContext } from '../query'
import { useGetList, useGetMany } from '../query'
import type { UseResourceContext } from '../resource'
import { useResource } from '../resource'
import type { ToMaybeRefs } from '../utils/refs'

export type UseSelectProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = ToMaybeRefs<
	Select.Props<TData, TError, TResultData, TPageParam>
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
		options: ComputedRef<Select.OptionItem[] | undefined>
		search: Ref<string | undefined> // TODO: TSearchValue from generic
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
	const search = ref<string | undefined>()

	const resourceName = computed(() => getResourceIdentifier({
		resource: unref(resource),
		resourceFromProp: unref(props?.resource),
	}))
	const fetcherName = computed(() => getFetcherName({
		resource: unref(resource),
		fetcherNameFromProp: unref(props?.fetcherName),
	}))
	const filters = computed(() => Select.getListFilters({
		filterFormProp: unref(props?.filters),
		searchValue: unref(search),
		labelKey: unref(props?.labelKey),
		searchToFilters: unref(props?.searchToFilters),
	}))
	const ids = computed(() => Select.getValueIds({
		valueFormProp: unref(props?.value),
	}))

	const listResult = useGetList<TData, TError, TResultData, TPageParam>({
		...props,
		resource: resourceName,
		fetcherName,
		filters,
		queryOptions: props?.queryOptionsForOptions,
	})

	const manyResult = useGetMany<TData, TError, TResultData>({
		resource: resourceName,
		ids,
		fetcherName,
		queryOptions: props?.queryOptionsForValue,
		meta: props?.meta,
	})

	const options = computed(() => Select.getOptions({
		listData: unref(listResult.data),
		manyData: unref(manyResult.data),
		labelKey: unref(props?.labelKey),
		valueKey: unref(props?.valueKey),
	}))

	return {
		...listResult,
		options,
		search,
	}
}
