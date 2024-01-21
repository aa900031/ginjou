import type { Get } from 'type-fest'
import { get, unionBy } from 'lodash-unified'
import { type BaseRecord, FilterOperator, type Filters, type GetListResult, type GetManyResult } from '../query'
import { resolveFilters } from './list'

export interface GetOptionsProps<
	TResultData extends BaseRecord,
	TLabelKey extends string,
	TValueKey extends string,
> {
	listData: GetListResult<TResultData> | undefined
	manyData: GetManyResult<TResultData> | undefined
	labelKey: TLabelKey
	valueKey: TValueKey
}

export interface OptionItem<
	TResultData extends BaseRecord,
	TLabelKey extends string,
	TValueKey extends string,
> {
	label: Get<TResultData, TLabelKey>
	value: Get<TResultData, TValueKey>
}

function toOptionItem<
	TResultData extends BaseRecord,
	TLabelKey extends string,
	TValueKey extends string,
>(
	data: TResultData,
	labelKey: TLabelKey,
	valueKey: TValueKey,
): OptionItem<TResultData, TLabelKey, TValueKey> {
	return {
		label: get(data, labelKey),
		value: get(data, valueKey),
	}
}

export function getOptions<
	TResultData extends BaseRecord,
	TLabelKey extends string,
	TValueKey extends string,
>(
	{
		listData,
		manyData,
		labelKey,
		valueKey,
	}: GetOptionsProps<TResultData, TLabelKey, TValueKey>,
): OptionItem<TResultData, TLabelKey, TValueKey>[] {
	const listOptions = listData?.data.map(item => toOptionItem(item, labelKey, valueKey))
	const valueOptions = manyData?.data.map(item => toOptionItem(item, labelKey, valueKey))

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

export interface CreateSetSearchFnProps<
	TSearchValue,
> {
	getLabelKey: () => string | undefined
	searchToFilters: SearchToFiltersFn<TSearchValue> | undefined
	update: (value: Filters | undefined) => void
}

export function createSetSearchFn<
	TSearchValue,
>(
	{
		getLabelKey,
		searchToFilters,
		update,
	}: CreateSetSearchFnProps<TSearchValue>,
): SetSearchFn<TSearchValue> {
	return function setSearch(value) {
		const nextValue = typeof searchToFilters === 'function'
			? searchToFilters(value)
			: value != null
				? [
						{
							field: `${getLabelKey() ?? 'title'}`,
							operator: FilterOperator.contains,
							value,
						},
					]
				: undefined

		update(nextValue)
	}
}

export interface GetListFiltersProps {
	filterFormProp: Filters | undefined
	searchFilters: Filters | undefined
}

export function getListFilters(
	{
		filterFormProp,
		searchFilters,
	}: GetListFiltersProps,
): Filters | undefined {
	return resolveFilters(undefined, filterFormProp, searchFilters)
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
