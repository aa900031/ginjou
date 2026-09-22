import { describe, expect, it, vi } from 'vitest'
import { FilterOperator } from '../query'
import {
	getListFilters,
	getOptions,
	getPagination,
	getPropCurrentPage,
	getPropPerPage,
	getValueIds,
} from './select'

describe('getOptions', () => {
	it('should combine list and many options without duplicate values', () => {
		expect(getOptions({
			listData: {
				data: [
					{ id: '1', title: 'Post 1' },
					{ id: '2', title: 'Post 2' },
				],
			} as any,
			manyData: {
				data: [
					{ id: '2', title: 'Post 2 duplicate' },
					{ id: '3', title: 'Post 3' },
				],
			} as any,
			labelKey: 'title',
			valueKey: 'id',
			selectedOptionsOrder: undefined,
		})).toEqual([
			{
				label: 'Post 1',
				value: '1',
				data: { id: '1', title: 'Post 1' },
			},
			{
				label: 'Post 2',
				value: '2',
				data: { id: '2', title: 'Post 2' },
			},
			{
				label: 'Post 3',
				value: '3',
				data: { id: '3', title: 'Post 3' },
			},
		])
	})

	it('should use default title and id keys', () => {
		expect(getOptions({
			listData: {
				data: [
					{ id: '1', title: 'Post 1' },
				],
			} as any,
			manyData: undefined,
			labelKey: undefined,
			valueKey: undefined,
			selectedOptionsOrder: undefined,
		})).toEqual([
			{
				label: 'Post 1',
				value: '1',
				data: { id: '1', title: 'Post 1' },
			},
		])
	})

	it('should support nested label and value keys', () => {
		expect(getOptions({
			listData: {
				data: [
					{ meta: { slug: 'post-1' }, author: { name: 'Jane' } },
				],
			} as any,
			manyData: undefined,
			labelKey: 'author.name',
			valueKey: 'meta.slug',
			selectedOptionsOrder: undefined,
		})).toEqual([
			{
				label: 'Jane',
				value: 'post-1',
				data: { meta: { slug: 'post-1' }, author: { name: 'Jane' } },
			},
		])
	})
})

describe('getOptions ordering and getters', () => {
	const listData = { data: [{ id: '1', title: 'Post 1' }, { id: '2', title: 'Post 2' }] } as any
	const manyData = { data: [{ id: '2', title: 'Post 2 selected' }, { id: '3', title: 'Post 3' }] } as any

	it('should put selected options first when selectedOptionsOrder is selected-first', () => {
		expect(getOptions({
			listData,
			manyData,
			labelKey: undefined,
			valueKey: undefined,
			selectedOptionsOrder: 'selected-first',
		}).map(item => [item.value, item.label])).toEqual([
			['2', 'Post 2 selected'],
			['3', 'Post 3'],
			['1', 'Post 1'],
		])
	})

	it('should accept getter functions for label and value', () => {
		expect(getOptions({
			listData,
			manyData: undefined,
			labelKey: item => `#${item.id} ${item.title}`,
			valueKey: item => Number(item.id),
			selectedOptionsOrder: undefined,
		})).toEqual([
			{ label: '#1 Post 1', value: 1, data: { id: '1', title: 'Post 1' } },
			{ label: '#2 Post 2', value: 2, data: { id: '2', title: 'Post 2' } },
		])
	})
})

describe('getListFilters', () => {
	it('should search on searchKey instead of labelKey when given', () => {
		expect(getListFilters({
			filterFormProp: undefined,
			searchValue: 'post',
			labelKey: 'title',
			searchKey: 'slug',
			searchToFilters: undefined,
		})).toEqual([
			{
				field: 'slug',
				operator: FilterOperator.contains,
				value: 'post',
			},
		])
	})

	it('should fall back to labelKey when searchKey is empty', () => {
		expect(getListFilters({
			filterFormProp: undefined,
			searchValue: 'post',
			labelKey: 'author.name',
			searchKey: '',
			searchToFilters: undefined,
		})).toEqual([
			{
				field: 'author.name',
				operator: FilterOperator.contains,
				value: 'post',
			},
		])
	})

	it('should fall back to the default key when labelKey is a getter', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

		expect(getListFilters({
			filterFormProp: undefined,
			searchValue: 'post',
			labelKey: (item: any) => item.title,
			searchKey: undefined,
			searchToFilters: undefined,
		})).toEqual([
			{
				field: 'title',
				operator: FilterOperator.contains,
				value: 'post',
			},
		])
		expect(warn).toHaveBeenCalledOnce()

		warn.mockRestore()
	})

	it('should fall back to the default key when labelKey is empty', () => {
		expect(getListFilters({
			filterFormProp: undefined,
			searchValue: 'post',
			labelKey: '',
			searchKey: undefined,
			searchToFilters: undefined,
		})).toEqual([
			{
				field: 'title',
				operator: FilterOperator.contains,
				value: 'post',
			},
		])
	})

	it('should not search when search value is an empty string', () => {
		expect(getListFilters({
			filterFormProp: [
				{
					field: 'published',
					operator: FilterOperator.eq,
					value: true,
				},
			],
			searchValue: '',
			labelKey: 'title',
			searchKey: undefined,
			searchToFilters: undefined,
		})).toEqual([
			{
				field: 'published',
				operator: FilterOperator.eq,
				value: true,
			},
		])
	})

	it('should build a default contains filter from search value', () => {
		expect(getListFilters({
			filterFormProp: undefined,
			searchValue: 'post',
			labelKey: 'title',
			searchKey: undefined,
			searchToFilters: undefined,
		})).toEqual([
			{
				field: 'title',
				operator: FilterOperator.contains,
				value: 'post',
			},
		])
	})

	it('should use default title key when label key is missing', () => {
		expect(getListFilters({
			filterFormProp: undefined,
			searchValue: 'post',
			labelKey: undefined,
			searchKey: undefined,
			searchToFilters: undefined,
		})).toEqual([
			{
				field: 'title',
				operator: FilterOperator.contains,
				value: 'post',
			},
		])
	})

	it('should allow searchToFilters to override default search behavior', () => {
		expect(getListFilters({
			filterFormProp: undefined,
			searchValue: 'post',
			labelKey: 'title',
			searchKey: undefined,
			searchToFilters: value => [
				{
					field: 'slug',
					operator: FilterOperator.eq,
					value,
				},
			],
		})).toEqual([
			{
				field: 'slug',
				operator: FilterOperator.eq,
				value: 'post',
			},
		])
	})

	it('should merge search filters with filter form filters', () => {
		expect(getListFilters({
			filterFormProp: [
				{
					field: 'published',
					operator: FilterOperator.eq,
					value: true,
				},
			],
			searchValue: 'post',
			labelKey: 'title',
			searchKey: undefined,
			searchToFilters: undefined,
		})).toEqual([
			{
				field: 'title',
				operator: FilterOperator.contains,
				value: 'post',
			},
			{
				field: 'published',
				operator: FilterOperator.eq,
				value: true,
			},
		])
	})

	it('should return only form filters when search value is null', () => {
		expect(getListFilters({
			filterFormProp: [
				{
					field: 'published',
					operator: FilterOperator.eq,
					value: true,
				},
			],
			searchValue: null,
			labelKey: 'title',
			searchKey: undefined,
			searchToFilters: undefined,
		})).toEqual([
			{
				field: 'published',
				operator: FilterOperator.eq,
				value: true,
			},
		])
	})
})

describe('getValueIds', () => {
	it('should return undefined for nullish values', () => {
		expect(getValueIds({ valueFormProp: undefined })).toBeUndefined()
		expect(getValueIds({ valueFormProp: null })).toBeUndefined()
	})

	it('should wrap scalar values in an array', () => {
		expect(getValueIds({ valueFormProp: '1' })).toEqual(['1'])
	})

	it('should return arrays as-is', () => {
		const ids = ['1', '2']
		expect(getValueIds({ valueFormProp: ids })).toBe(ids)
	})
})

describe('getPropCurrentPage', () => {
	it('should read current page from prop', () => {
		expect(getPropCurrentPage({
			prop: { current: 2, perPage: 10 },
			prev: 1,
		})).toBe(2)
	})

	it('should return undefined when prop is missing', () => {
		expect(getPropCurrentPage({
			prop: undefined,
			prev: 1,
		})).toBeUndefined()
	})

	it('should preserve the previous value when the resolved current page is equal', () => {
		expect(getPropCurrentPage({
			prop: { current: 2, perPage: 10 },
			prev: 2,
		})).toBe(2)
	})
})

describe('getPropPerPage', () => {
	it('should read perPage from prop', () => {
		expect(getPropPerPage({
			prop: { current: 2, perPage: 10 },
			prev: 5,
		})).toBe(10)
	})

	it('should return undefined when prop is missing', () => {
		expect(getPropPerPage({
			prop: undefined,
			prev: 5,
		})).toBeUndefined()
	})

	it('should preserve the previous value when the resolved perPage is equal', () => {
		expect(getPropPerPage({
			prop: { current: 2, perPage: 10 },
			prev: 10,
		})).toBe(10)
	})
})

describe('getPagination', () => {
	it('should return pagination when current page and perPage are both present', () => {
		expect(getPagination({
			currentPage: 2,
			perPage: 10,
		})).toEqual({
			current: 2,
			perPage: 10,
		})
	})

	it('should return undefined when current page or perPage is missing', () => {
		expect(getPagination({
			currentPage: undefined,
			perPage: 10,
		})).toBeUndefined()

		expect(getPagination({
			currentPage: 2,
			perPage: undefined,
		})).toBeUndefined()
	})
})
