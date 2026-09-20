import type { Simplify, ValueOf } from 'type-fest'
import type { BaseRecord, Filters, GetList, GetListResult, GetManyByOne, GetManyResult, Pagination, RecordKey } from '../query'
import { unionBy } from 'es-toolkit'
import { get } from 'es-toolkit/compat'
import { FilterOperator } from '../query'
import { getSubValue } from '../utils/sub-value'
import { resolveFilters } from './list'

export const SelectedOptionsOrder = {
	InPlace: 'in-place',
	SelectedFirst: 'selected-first',
} as const

export type SelectedOptionsOrderValues = ValueOf<typeof SelectedOptionsOrder>

/** A dot path into the record, or a getter over it. */
export type KeyOrGetter<
	TData,
	TReturn = any,
> = string | ((item: TData) => TReturn)

export type Props<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
	TValue extends RecordKey = RecordKey,
	TSearchValue = string,
> = Simplify<
	& Omit<
		GetList.Props<TData, TError, TResultData, TPageParam>,
			| 'queryOptions'
	>
	& {
		labelKey?: KeyOrGetter<TResultData>
		valueKey?: KeyOrGetter<TResultData, TValue>
		/** Field for the default `contains` search filter. Falls back to a string `labelKey`, then `'title'`. */
		searchKey?: string
		/** Where selected options land when merged with the list page. */
		selectedOptionsOrder?: SelectedOptionsOrderValues
		/** Selected record key(s): the same values `valueKey` puts on each option. */
		value?: TValue | TValue[]
		searchToFilters?: SearchToFiltersFn<TSearchValue>
		queryOptionsForOptions?: NonNullable<GetList.Props<TData, TError, TResultData, TPageParam>['queryOptions']>
		queryOptionsForValue?: NonNullable<GetManyByOne.Props<TData, TError, TResultData>['queryOptions']>
		metaForValue?: NonNullable<GetManyByOne.Props<TData, TError, TResultData>['meta']>
	}
>

export interface GetOptionsProps<
	TResultData extends BaseRecord,
	TPageParam,
	TValue extends RecordKey = RecordKey,
> {
	listData: GetListResult<TResultData, TPageParam> | undefined
	manyData: GetManyResult<TResultData> | undefined
	labelKey: KeyOrGetter<TResultData> | undefined
	valueKey: KeyOrGetter<TResultData, TValue> | undefined
	selectedOptionsOrder: SelectedOptionsOrderValues | undefined
}

export interface OptionItem<
	TResultData extends BaseRecord,
	TValue extends RecordKey = RecordKey,
> {
	label: any
	value: TValue
	data: TResultData
}

export function getOptions<
	TResultData extends BaseRecord,
	TPageParam,
	TValue extends RecordKey = RecordKey,
>(
	{
		listData,
		manyData,
		labelKey = 'title',
		valueKey = 'id',
		selectedOptionsOrder = SelectedOptionsOrder.InPlace,
	}: GetOptionsProps<TResultData, TPageParam, TValue>,
): OptionItem<TResultData, TValue>[] {
	const listOptions = listData?.data.map(item => toOptionItem(item, labelKey, valueKey)) ?? []
	const valueOptions = manyData?.data.map(item => toOptionItem(item, labelKey, valueKey)) ?? []

	return selectedOptionsOrder === SelectedOptionsOrder.SelectedFirst
		? unionBy(valueOptions, listOptions, item => item.value)
		: unionBy(listOptions, valueOptions, item => item.value)
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

export interface GetSearchKeyProps {
	searchKey: string | undefined
	labelKey: KeyOrGetter<any> | undefined
}

export function getSearchKey(
	{
		searchKey,
		labelKey,
	}: GetSearchKeyProps,
): string {
	return (searchKey || (typeof labelKey === 'string' ? labelKey : ''))
		|| 'title'
}

export interface GetListFiltersProps<
	TSearchValue,
> {
	filterFormProp: Filters | undefined
	searchValue: TSearchValue | undefined
	labelKey: KeyOrGetter<any> | undefined
	searchKey: string | undefined
	searchToFilters: SearchToFiltersFn<TSearchValue> | undefined
}

export function getListFilters<
	TSearchValue,
>(
	{
		filterFormProp,
		searchValue,
		labelKey,
		searchKey,
		searchToFilters,
	}: GetListFiltersProps<TSearchValue>,
): Filters | undefined {
	const searchFilters = typeof searchToFilters === 'function'
		? searchToFilters(searchValue)
		: searchValue !== null
			? [
					{
						field: getSearchKey({ searchKey, labelKey }),
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

export interface GetValueIdsProps<
	TValue extends RecordKey = RecordKey,
> {
	valueFormProp: TValue | TValue[] | null | undefined
}

export function getValueIds<
	TValue extends RecordKey,
>(
	{
		valueFormProp,
	}: GetValueIdsProps<TValue>,
): TValue[] | undefined {
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
	TValue extends RecordKey,
>(
	data: TResultData,
	labelKey: KeyOrGetter<TResultData>,
	valueKey: KeyOrGetter<TResultData, TValue>,
): OptionItem<TResultData, TValue> {
	return {
		label: resolveKey(data, labelKey),
		value: resolveKey(data, valueKey),
		data,
	}
}

function resolveKey<
	TData,
	TReturn,
>(
	data: TData,
	key: KeyOrGetter<TData, TReturn>,
): TReturn {
	return typeof key === 'function'
		? key(data)
		: get(data, key)
}
