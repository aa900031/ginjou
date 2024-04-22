import { get, unionBy } from 'lodash-unified'
import type { Simplify } from 'type-fest'
import type { BaseRecord, Filters, GetList, GetListResult, GetMany, GetManyResult } from '../query'
import { FilterOperator } from '../query'
import { resolveFilters } from './list'

export type Props<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = Simplify<
	& Omit<
			GetList.Props<TData, TError, TResultData, TPageParam>,
			| 'queryOptions'
		>
	& {
		labelKey?: string
		valueKey?: string
		value?: any | any[] // TODO: generice
		searchToFilters?: SearchToFiltersFn<any> // TODO: generic
		queryOptionsForOptions?: NonNullable<GetList.Props<TData, TError, TResultData, TPageParam>['queryOptions']>
		queryOptionsForValue?: NonNullable<GetMany.Props<TData, TError, TResultData>['queryOptions']>
	}
>

export interface GetOptionsProps<
	TResultData extends BaseRecord,
> {
	listData: GetListResult<TResultData> | undefined
	manyData: GetManyResult<TResultData> | undefined
	labelKey: string | undefined
	valueKey: string | undefined
}

export interface OptionItem {
	label: any
	value: any
}

function toOptionItem<
	TResultData,
>(
	data: TResultData,
	labelKey: string,
	valueKey: string,
): OptionItem {
	return {
		label: get(data, labelKey),
		value: get(data, valueKey),
	}
}

export function getOptions<
	TResultData extends BaseRecord,
>(
	{
		listData,
		manyData,
		labelKey,
		valueKey,
	}: GetOptionsProps<TResultData>,
): OptionItem[] {
	const listOptions = listData?.data.map(item => toOptionItem(item, labelKey ?? 'title', valueKey ?? 'id'))
	const valueOptions = manyData?.data.map(item => toOptionItem(item, labelKey ?? 'title', valueKey ?? 'id'))

	return unionBy(listOptions, valueOptions, 'value')
}

export type SearchToFiltersFn<
	TSearchValue,
> = (
	value: TSearchValue | undefined,
) => Filters | undefined

export type SetSearchFn<
	TSearchValue,
> = (
	value: TSearchValue | undefined
) => void

export interface GetListFiltersProps<
	TSearchValue,
> {
	filterFormProp: Filters | undefined
	searchValue: TSearchValue | undefined
	labelKey: string | undefined
	searchToFilters: SearchToFiltersFn<TSearchValue> | undefined
}

export function getListFilters<
	TSearchValue,
>(
	{
		filterFormProp,
		searchValue,
		labelKey,
		searchToFilters,
	}: GetListFiltersProps<TSearchValue>,
): Filters | undefined {
	const searchFilters = typeof searchToFilters === 'function'
		? searchToFilters(searchValue)
		: searchValue !== null
			? [
					{
						field: `${labelKey ?? 'title'}`,
						operator: FilterOperator.contains,
						value: searchValue,
					},
				]
			: undefined

	return resolveFilters(
		searchFilters ?? [],
		filterFormProp,
	)
}

export interface GetValueIdsProps {
	valueFormProp: any | any[] | undefined
}

export function getValueIds(
	{
		valueFormProp,
	}: GetValueIdsProps,
) {
	if (valueFormProp == null)
		return

	if (Array.isArray(valueFormProp))
		return valueFormProp

	return [valueFormProp]
}
