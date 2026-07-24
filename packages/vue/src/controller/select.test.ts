import { FilterOperator } from '@ginjou/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, unref } from 'vue-demi'
import { useSelect } from './select'

const mocks = vi.hoisted(() => ({
	useGetList: vi.fn(),
	useGetManyByOne: vi.fn(),
	useResource: vi.fn(),
}))

vi.mock('../query', () => ({
	useGetList: mocks.useGetList,
	useGetManyByOne: mocks.useGetManyByOne,
}))

vi.mock('./resource', () => ({
	useResource: mocks.useResource,
}))

describe('useSelect', () => {
	beforeEach(() => {
		mocks.useGetList.mockReset()
		mocks.useGetManyByOne.mockReset()
		mocks.useResource.mockReset()

		mocks.useResource.mockReturnValue(ref({
			resource: {
				name: 'posts',
			},
		}))
	})

	it('should hydrate multiple selected values and merge them with list options', () => {
		let manyProps: Record<string, unknown> | undefined
		const value = ref(['1', '2'])

		mocks.useGetList.mockReturnValue({
			data: ref({
				data: [
					{ id: '1', title: 'Post 1' },
				],
			}),
		})
		mocks.useGetManyByOne.mockImplementation((props) => {
			manyProps = props
			return {
				data: ref({
					data: [
						{ id: '2', title: 'Post 2' },
					],
				}),
			}
		})

		const result = useSelect({
			resource: 'posts',
			value,
		})

		expect(unref(manyProps?.ids)).toEqual(['1', '2'])
		expect(unref(result.options)).toEqual([
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
		])

		value.value = ['2']

		expect(unref(manyProps?.ids)).toEqual(['2'])
	})

	it('should expose writable search and pagination refs to the list query', () => {
		let listProps: Record<string, unknown> | undefined

		mocks.useGetList.mockImplementation((props) => {
			listProps = props
			return {
				data: ref(),
			}
		})
		mocks.useGetManyByOne.mockReturnValue({
			data: ref(),
		})

		const result = useSelect({
			resource: 'posts',
			pagination: {
				current: 1,
				perPage: 10,
			},
		})

		result.search.value = 'draft'
		result.currentPage.value = 2
		result.perPage.value = 25

		expect(unref(listProps?.filters)).toEqual([
			{
				field: 'title',
				operator: FilterOperator.contains,
				value: 'draft',
			},
		])
		expect(unref(listProps?.pagination)).toEqual({
			current: 2,
			perPage: 25,
		})
	})

	it('should use custom label and value keys for options and search filters', () => {
		let listProps: Record<string, unknown> | undefined

		mocks.useGetList.mockImplementation((props) => {
			listProps = props
			return {
				data: ref({
					data: [
						{
							id: '1',
							meta: { slug: 'post-1' },
							author: { name: 'Jane' },
						},
					],
				}),
			}
		})
		mocks.useGetManyByOne.mockReturnValue({
			data: ref(),
		})

		const result = useSelect({
			resource: 'posts',
			labelKey: 'author.name',
			valueKey: 'meta.slug',
		})

		result.search.value = 'Jane'

		expect(unref(result.options)).toEqual([
			{
				label: 'Jane',
				value: 'post-1',
				data: {
					id: '1',
					meta: { slug: 'post-1' },
					author: { name: 'Jane' },
				},
			},
		])
		expect(unref(listProps?.filters)).toEqual([
			{
				field: 'author.name',
				operator: FilterOperator.contains,
				value: 'Jane',
			},
		])
	})

	it('should forward option and selected-value query configuration', () => {
		let listProps: Record<string, unknown> | undefined
		let manyProps: Record<string, unknown> | undefined
		const queryOptionsForOptions = { staleTime: 1_000 }
		const queryOptionsForValue = { enabled: false }
		const metaForValue = { source: 'select' }

		mocks.useGetList.mockImplementation((props) => {
			listProps = props
			return {
				data: ref(),
			}
		})
		mocks.useGetManyByOne.mockImplementation((props) => {
			manyProps = props
			return {
				data: ref(),
			}
		})

		useSelect({
			resource: 'posts',
			queryOptionsForOptions,
			queryOptionsForValue,
			metaForValue,
		})

		expect(listProps?.queryOptions).toBe(queryOptionsForOptions)
		expect(manyProps?.queryOptions).toBe(queryOptionsForValue)
		expect(manyProps?.meta).toBe(metaForValue)
	})

	it('should use custom searchToFilters for the list query', () => {
		let listProps: Record<string, unknown> | undefined
		const searchToFilters = vi.fn(value => [
			{
				field: 'slug',
				operator: FilterOperator.eq,
				value,
			},
		])

		mocks.useGetList.mockImplementation((props) => {
			listProps = props
			return {
				data: ref(),
			}
		})
		mocks.useGetManyByOne.mockReturnValue({
			data: ref(),
		})

		const result = useSelect({
			resource: 'posts',
			searchToFilters,
		})

		result.search.value = 'draft-post'
		const filters = unref(listProps?.filters)

		expect(searchToFilters).toHaveBeenLastCalledWith('draft-post')
		expect(filters).toEqual([
			{
				field: 'slug',
				operator: FilterOperator.eq,
				value: 'draft-post',
			},
		])
	})
})
