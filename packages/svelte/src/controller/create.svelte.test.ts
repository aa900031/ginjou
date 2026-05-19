import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCreate } from './create.svelte'

const mocks = vi.hoisted(() => ({
	createSaveFn: vi.fn(),
	getFetcherName: vi.fn(),
	getIsLoading: vi.fn(),
	getName: vi.fn(),
	useCreateOne: vi.fn(),
	useNavigateTo: vi.fn(),
	useResource: vi.fn(),
}))

vi.mock('@ginjou/core', () => ({
	Create: {
		createSaveFn: mocks.createSaveFn,
		getIsLoading: mocks.getIsLoading,
	},
	Resource: {
		getFetcherName: mocks.getFetcherName,
		getName: mocks.getName,
	},
}))

vi.mock('../query', () => ({
	useCreateOne: mocks.useCreateOne,
}))

vi.mock('../router', () => ({
	useNavigateTo: mocks.useNavigateTo,
}))

vi.mock('./resource.svelte', () => ({
	useResource: mocks.useResource,
}))

describe('useCreate', () => {
	beforeEach(() => {
		mocks.createSaveFn.mockReset()
		mocks.getFetcherName.mockReset()
		mocks.getIsLoading.mockReset()
		mocks.getName.mockReset()
		mocks.useCreateOne.mockReset()
		mocks.useNavigateTo.mockReset()
		mocks.useResource.mockReset()

		mocks.getFetcherName.mockImplementation(({ fetcherNameFromProp }: { fetcherNameFromProp?: string }) => fetcherNameFromProp ?? 'default')
		mocks.getIsLoading.mockImplementation(({ isPending }: { isPending: boolean }) => isPending)
		mocks.getName.mockImplementation(({ resourceFromProp }: { resourceFromProp?: string }) => resourceFromProp ?? 'posts')
		mocks.useNavigateTo.mockReturnValue(vi.fn())
		mocks.useResource.mockReturnValue({
			value: {
				name: 'posts',
			},
		})
	})

	it('should expose derived loading state and save fn', () => {
		const save = vi.fn()
		const mutateAsync = vi.fn()

		mocks.createSaveFn.mockReturnValue(save)
		mocks.useCreateOne.mockReturnValue({
			isPending: true,
			mutateAsync,
		})

		const result = useCreate({
			resource: 'posts',
		})

		expect(result.isLoading).toBe(true)
		expect(result.save).toBe(save)
		expect(mocks.createSaveFn).toHaveBeenCalled()
		expect(mocks.useCreateOne.mock.calls[0][0]()).toMatchObject({
			resource: 'posts',
			fetcherName: 'default',
		})
	})
})
