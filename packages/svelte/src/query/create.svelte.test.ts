import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCreateOne } from './create.svelte'

const mocks = vi.hoisted(() => ({
	createErrorHandler: vi.fn(),
	createMutateAsyncFn: vi.fn(),
	createMutateFn: vi.fn(),
	createMutation: vi.fn(),
	createMutationFn: vi.fn(),
	createPlacholerDataFn: vi.fn(),
	createSuccessHandler: vi.fn(),
	useCheckError: vi.fn(),
	useFetchersContext: vi.fn(),
	useNotify: vi.fn(),
	usePublish: vi.fn(),
	useQueryClientContext: vi.fn(),
	useTranslate: vi.fn(),
}))

vi.mock('@ginjou/core', () => ({
	CreateOne: {
		createErrorHandler: mocks.createErrorHandler,
		createMutateAsyncFn: mocks.createMutateAsyncFn,
		createMutateFn: mocks.createMutateFn,
		createMutationFn: mocks.createMutationFn,
		createSuccessHandler: mocks.createSuccessHandler,
	},
}))

vi.mock('@tanstack/svelte-query', () => ({
	createMutation: mocks.createMutation,
}))

vi.mock('../auth', () => ({
	useCheckError: mocks.useCheckError,
}))

vi.mock('../i18n', () => ({
	useTranslate: mocks.useTranslate,
}))

vi.mock('../notification', () => ({
	useNotify: mocks.useNotify,
}))

vi.mock('../realtime', () => ({
	usePublish: mocks.usePublish,
}))

vi.mock('./fetchers', () => ({
	useFetchersContext: mocks.useFetchersContext,
}))

vi.mock('./query-client', () => ({
	useQueryClientContext: mocks.useQueryClientContext,
}))

describe('useCreateOne', () => {
	beforeEach(() => {
		mocks.createErrorHandler.mockReset()
		mocks.createMutateAsyncFn.mockReset()
		mocks.createMutateFn.mockReset()
		mocks.createMutation.mockReset()
		mocks.createMutationFn.mockReset()
		mocks.createSuccessHandler.mockReset()
		mocks.useCheckError.mockReset()
		mocks.useFetchersContext.mockReset()
		mocks.useNotify.mockReset()
		mocks.usePublish.mockReset()
		mocks.useQueryClientContext.mockReset()
		mocks.useTranslate.mockReset()

		mocks.createErrorHandler.mockReturnValue(vi.fn())
		mocks.createMutationFn.mockReturnValue(vi.fn())
		mocks.createSuccessHandler.mockReturnValue(vi.fn())
		mocks.useCheckError.mockReturnValue({
			mutateAsync: vi.fn(),
		})
		mocks.useFetchersContext.mockReturnValue({})
		mocks.useNotify.mockReturnValue({})
		mocks.usePublish.mockReturnValue({})
		mocks.useQueryClientContext.mockReturnValue({})
		mocks.useTranslate.mockReturnValue(vi.fn())
	})

	it('should expose wrapped mutate fns', async () => {
		const originMutate = vi.fn()
		const originMutateAsync = vi.fn().mockResolvedValue('ok')

		mocks.createMutation.mockReturnValue({
			mutate: originMutate,
			mutateAsync: originMutateAsync,
		})
		mocks.createMutateFn.mockImplementation(({ originFn }: { originFn: (...args: any[]) => void }) => (...args: any[]) => originFn(...args))
		mocks.createMutateAsyncFn.mockImplementation(({ originFn }: { originFn: (...args: any[]) => Promise<unknown> }) => (...args: any[]) => originFn(...args))

		const result = useCreateOne({
			resource: 'posts',
		})

		result.mutate({
			resource: 'posts',
			params: {
				title: 'A',
			},
		} as any)
		await result.mutateAsync({
			resource: 'posts',
			params: {
				title: 'B',
			},
		} as any)

		expect(originMutate).toHaveBeenCalledTimes(1)
		expect(originMutateAsync).toHaveBeenCalledTimes(1)
		expect(mocks.createMutateFn).toHaveBeenCalled()
		expect(mocks.createMutateAsyncFn).toHaveBeenCalled()
	})
})
