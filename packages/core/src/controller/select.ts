import type { Simplify } from 'type-fest'
import type { BaseRecord, Filters, GetList, GetListResult, GetMany, GetManyResult, Pagination } from '../query'
import { unionBy } from 'es-toolkit'
import { get } from 'es-toolkit/compat'
import { FilterOperator } from '../query'
import { getSubValue } from '../utils/sub-value'
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
	TPageParam,
> {
	listData: GetListResult<TResultData, TPageParam> | undefined
	manyData: GetManyResult<TResultData> | undefined
	labelKey: string | undefined
	valueKey: string | undefined
}

export interface OptionItem<
	TResultData extends BaseRecord,
> {
	label: any
	value: any
	data: TResultData
}

export function getOptions<
	TResultData extends BaseRecord,
	TPageParam,
>(
	{
		listData,
		manyData,
		labelKey = 'title',
		valueKey = 'id',
	}: GetOptionsProps<TResultData, TPageParam>,
): OptionItem<TResultData>[] {
	const listOptions = listData?.data.map(item => toOptionItem(item, labelKey, valueKey))
	const valueOptions = manyData?.data.map(item => toOptionItem(item, labelKey, valueKey))

	return unionBy(listOptions ?? [], valueOptions ?? [], item => item.value)
}

export type SearchToFiltersFn<
	TSearchValue,
> = (
	value: TSearchValue | undefined,
) => Filters | undefined

export type SetSearchFn<
	TSearchValue,
> = (
	value: TSearchValue | undefined,
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
		searchFilters,
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

export interface GetPropCurrentPageProps<
	TPageParam,
> {
	prop: Pagination<TPageParam> | undefined
	prev?: Pagination<TPageParam>['current'] | undefined
}

export function getPropCurrentPage<
	TPageParam,
>(
	{
		prop,
		prev,
	}: GetPropCurrentPageProps<TPageParam>,
): Pagination<TPageParam>['current'] | undefined {
	return getSubValue({
		path: 'current',
		prop,
		prev,
	})
}

export interface GetPropPerPageProps<
	TPageParam,
> {
	prop: Pagination<TPageParam> | undefined
	prev?: Pagination<TPageParam>['perPage'] | undefined
}

export function getPropPerPage<
	TPageParam,
>(
	{
		prop,
		prev,
	}: GetPropPerPageProps<TPageParam>,
): Pagination<TPageParam>['perPage'] | undefined {
	return getSubValue({
		path: 'perPage',
		prop,
		prev,
	})
}

export interface GetPaginationProps<TPageParam> {
	currentPage: Pagination<TPageParam>['current'] | undefined
	perPage: Pagination<TPageParam>['perPage'] | undefined
}

export function getPagination<
	TPageParam,
>(
	{
		currentPage,
		perPage,
	}: GetPaginationProps<TPageParam>,
): Pagination<TPageParam> | undefined {
	if (currentPage == null || perPage == null)
		return

	return {
		current: currentPage,
		perPage,
	}
}

function toOptionItem<
	TResultData extends BaseRecord,
>(
	data: TResultData,
	labelKey: string,
	valueKey: string,
): OptionItem<TResultData> {
	return {
		label: get(data, labelKey),
		value: get(data, valueKey),
		data,
	}
}
