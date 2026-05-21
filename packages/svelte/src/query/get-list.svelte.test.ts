import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGetList } from './get-list.svelte'

const mocks = vi.hoisted(() => ({
	createQuery: vi.fn(),
	createQueryEnabledFn: vi.fn(),
	createQueryFn: vi.fn(),
	createQueryKey: vi.fn(),
	createSubscribeCallback: vi.fn(),
	createSuccessHandler: vi.fn(),
	createErrorHandler: vi.fn(),
	createPlacholerDataFn: vi.fn(),
	getSubscribeChannel: vi.fn(),
	getSubscribeParams: vi.fn(),
	resolveQueryProps: vi.fn(),
	useCheckError: vi.fn(),
	useFetchersContext: vi.fn(),
	useNotify: vi.fn(),
	useQueryCallbacks: vi.fn(),
	useQueryClientContext: vi.fn(),
	useRealtimeOptions: vi.fn(),
	useSubscribe: vi.fn(),
	useTranslate: vi.fn(),
}))

vi.mock('@ginjou/core', () => ({
	createSubscribeCallback: mocks.createSubscribeCallback,
	getSubscribeChannel: mocks.getSubscribeChannel,
	RealtimeAction: {
		Any: 'any',
	},
	GetList: {
		createErrorHandler: mocks.createErrorHandler,
		createPlacholerDataFn: mocks.createPlacholerDataFn,
		createQueryEnabledFn: mocks.createQueryEnabledFn,
		createQueryFn: mocks.createQueryFn,
		createQueryKey: mocks.createQueryKey,
		createSuccessHandler: mocks.createSuccessHandler,
		getSubscribeParams: mocks.getSubscribeParams,
		resolveQueryProps: mocks.resolveQueryProps,
	},
}))

vi.mock('@tanstack/svelte-query', () => ({
	createQuery: mocks.createQuery,
}))

vi.mock('tanstack-query-callbacks/svelte', () => ({
	useQueryCallbacks: mocks.useQueryCallbacks,
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
	useRealtimeOptions: mocks.useRealtimeOptions,
	useSubscribe: mocks.useSubscribe,
}))

vi.mock('./fetchers', () => ({
	useFetchersContext: mocks.useFetchersContext,
}))

vi.mock('./query-client', () => ({
	useQueryClientContext: mocks.useQueryClientContext,
}))

describe('useGetList', () => {
	beforeEach(() => {
		mocks.createErrorHandler.mockReset()
		mocks.createPlacholerDataFn.mockReset()
		mocks.createQuery.mockReset()
		mocks.createQueryEnabledFn.mockReset()
		mocks.createQueryFn.mockReset()
		mocks.createQueryKey.mockReset()
		mocks.createSubscribeCallback.mockReset()
		mocks.createSuccessHandler.mockReset()
		mocks.getSubscribeChannel.mockReset()
		mocks.getSubscribeParams.mockReset()
		mocks.resolveQueryProps.mockReset()
		mocks.useCheckError.mockReset()
		mocks.useFetchersContext.mockReset()
		mocks.useNotify.mockReset()
		mocks.useQueryCallbacks.mockReset()
		mocks.useQueryClientContext.mockReset()
		mocks.useRealtimeOptions.mockReset()
		mocks.useSubscribe.mockReset()
		mocks.useTranslate.mockReset()

		mocks.createErrorHandler.mockReturnValue(vi.fn())
		mocks.createPlacholerDataFn.mockReturnValue(undefined)
		mocks.createQuery.mockReturnValue({
			data: {
				data: [{ id: '1' }],
			},
		})
		mocks.createQueryEnabledFn.mockReturnValue(true)
		mocks.createQueryFn.mockReturnValue(vi.fn())
		mocks.createQueryKey.mockReturnValue(['posts'])
		mocks.createSubscribeCallback.mockReturnValue(vi.fn())
		mocks.createSuccessHandler.mockReturnValue(vi.fn())
		mocks.getSubscribeChannel.mockReturnValue('resources/posts')
		mocks.getSubscribeParams.mockReturnValue({
			resource: 'posts',
			type: 'list',
		})
		mocks.resolveQueryProps.mockImplementation(({ resource }: { resource: string }) => ({
			resource,
			fetcherName: 'default',
			pagination: undefined,
			sorters: undefined,
			filters: undefined,
			meta: undefined,
		}))
		mocks.useCheckError.mockReturnValue({
			mutateAsync: vi.fn(),
		})
		mocks.useFetchersContext.mockReturnValue({})
		mocks.useNotify.mockReturnValue({})
		mocks.useQueryClientContext.mockReturnValue({})
		mocks.useRealtimeOptions.mockReturnValue({
			value: {
				mode: 'auto',
			},
		})
		mocks.useTranslate.mockReturnValue(vi.fn())
	})

	it('should expose records accessor and subscribe params', () => {
		const result = useGetList({
			resource: 'posts',
		} as any)

		expect(result.records).toEqual([{ id: '1' }])
		expect(mocks.useSubscribe).toHaveBeenCalledTimes(1)

		const subscribeProps = mocks.useSubscribe.mock.calls[0][0]()
		expect(subscribeProps).toMatchObject({
			channel: 'resources/posts',
			params: {
				resource: 'posts',
				type: 'list',
			},
			actions: ['any'],
			enabled: true,
		})
	})
})
