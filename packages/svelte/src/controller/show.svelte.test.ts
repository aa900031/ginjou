import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useShow } from './show.svelte'

const mocks = vi.hoisted(() => ({
	getDefaultId: vi.fn(),
	getFetcherName: vi.fn(),
	getName: vi.fn(),
	useGetOne: vi.fn(),
	useResource: vi.fn(),
}))

vi.mock('@ginjou/core', () => ({
	Resource: {
		getFetcherName: mocks.getFetcherName,
		getName: mocks.getName,
	},
	Show: {
		getDefaultId: mocks.getDefaultId,
	},
}))

vi.mock('../query', () => ({
	useGetOne: mocks.useGetOne,
}))

vi.mock('./resource.svelte', () => ({
	useResource: mocks.useResource,
}))

vi.mock('../utils/watch.svelte', () => ({
	watch<T>(
		source: () => T,
		callback: (value: T, oldValue: T | undefined) => void,
		options?: { immediate?: boolean },
	) {
		if (options?.immediate)
			callback(source(), undefined)

		return () => {}
	},
}))

describe('useShow', () => {
	beforeEach(() => {
		mocks.getDefaultId.mockReset()
		mocks.getFetcherName.mockReset()
		mocks.getName.mockReset()
		mocks.useGetOne.mockReset()
		mocks.useResource.mockReset()

		mocks.getDefaultId.mockReturnValue('default-id')
		mocks.getFetcherName.mockImplementation(({ fetcherNameFromProp }: { fetcherNameFromProp?: string }) => fetcherNameFromProp ?? 'default')
		mocks.getName.mockImplementation(({ resourceFromProp }: { resourceFromProp?: string }) => resourceFromProp ?? 'posts')
		mocks.useResource
			.mockReturnValueOnce({ value: { name: 'posts' } })
			.mockReturnValueOnce({ value: { name: 'inferred-posts' } })
	})

	it('should expose writable id accessor', () => {
		let propsFn: (() => unknown) | undefined

		mocks.useGetOne.mockImplementation((props: () => unknown) => {
			propsFn = props
			return {}
		})

		const result = useShow({
			resource: 'posts',
		})

		expect(result.id).toBe('default-id')
		expect(propsFn?.()).toMatchObject({
			id: 'default-id',
			resource: 'posts',
			fetcherName: 'default',
		})

		result.id = 'next-id'

		expect(result.id).toBe('next-id')
		expect(propsFn?.()).toMatchObject({
			id: 'next-id',
		})
	})
})
