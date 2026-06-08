import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGetInfiniteList } from './get-infinite-list.svelte'

const mocks = vi.hoisted(() => ({
	createInfiniteQuery: vi.fn(),
	createQueryEnabledFn: vi.fn(),
	createQueryFn: vi.fn(),
	createQueryKey: vi.fn(),
	createSubscribeCallback: vi.fn(),
	createSuccessHandler: vi.fn(),
	createErrorHandler: vi.fn(),
	createPlacholerDataFn: vi.fn(),
	createGetNextPageParamFn: vi.fn(),
	createGetPreviousPageParamFn: vi.fn(),
	getInitialPageParam: vi.fn(),
	getRecords: vi.fn(),
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
		createQueryKey: mocks.createQueryKey,
		getSubscribeParams: mocks.getSubscribeParams,
	},
	GetInfiniteList: {
		createErrorHandler: mocks.createErrorHandler,
		createGetNextPageParamFn: mocks.createGetNextPageParamFn,
		createGetPreviousPageParamFn: mocks.createGetPreviousPageParamFn,
		createPlacholerDataFn: mocks.createPlacholerDataFn,
		createQueryEnabledFn: mocks.createQueryEnabledFn,
		createQueryFn: mocks.createQueryFn,
		createSuccessHandler: mocks.createSuccessHandler,
		getInitialPageParam: mocks.getInitialPageParam,
		getRecords: mocks.getRecords,
		resolveQueryProps: mocks.resolveQueryProps,
	},
}))

vi.mock('@tanstack/svelte-query', () => ({
	createInfiniteQuery: mocks.createInfiniteQuery,
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

describe('useGetInfiniteList', () => {
	beforeEach(() => {
		for (const mock of Object.values(mocks))
			mock.mockReset()

		mocks.createErrorHandler.mockReturnValue(vi.fn())
		mocks.createGetNextPageParamFn.mockReturnValue(vi.fn())
		mocks.createGetPreviousPageParamFn.mockReturnValue(vi.fn())
		mocks.createPlacholerDataFn.mockReturnValue(undefined)
		mocks.createInfiniteQuery.mockReturnValue({ data: undefined })
		mocks.createQueryEnabledFn.mockImplementation(({ getEnabled }) => {
			return () => getEnabled() !== false
		})
		mocks.createQueryFn.mockReturnValue(vi.fn())
		mocks.createQueryKey.mockReturnValue(['posts', 'getList'])
		mocks.createSubscribeCallback.mockReturnValue(vi.fn())
		mocks.createSuccessHandler.mockReturnValue(vi.fn())
		mocks.getInitialPageParam.mockReturnValue(1)
		mocks.getRecords.mockReturnValue(undefined)
		mocks.getSubscribeChannel.mockReturnValue('resources/posts')
		mocks.getSubscribeParams.mockReturnValue({ resource: 'posts', type: 'list' })
		mocks.resolveQueryProps.mockImplementation(({ resource, pagination }: { resource: string, pagination: { current: number, perPage: number } }) => ({
			resource,
			pagination,
			fetcherName: 'default',
			sorters: undefined,
			filters: undefined,
			meta: undefined,
		}))
		mocks.useCheckError.mockReturnValue({ mutateAsync: vi.fn() })
		mocks.useFetchersContext.mockReturnValue({})
		mocks.useNotify.mockReturnValue({})
		mocks.useQueryClientContext.mockReturnValue({})
		mocks.useRealtimeOptions.mockReturnValue({ value: { mode: 'auto' } })
		mocks.useTranslate.mockReturnValue(vi.fn())
	})

	it('should preserve the previous enabled snapshot when accessor props change', () => {
		let isEnabled = $state(false)

		useGetInfiniteList(() => ({
			resource: 'posts',
			pagination: {
				current: 1,
				perPage: 10,
			},
			queryOptions: {
				enabled: isEnabled,
			},
		}))

		const getQueryOptions = mocks.createInfiniteQuery.mock.calls[0][0]
		const disabledOptions = getQueryOptions()
		expect(disabledOptions.enabled()).toBe(false)

		isEnabled = true
		const enabledOptions = getQueryOptions()

		expect(enabledOptions.enabled()).toBe(true)
		expect(disabledOptions.enabled()).toBe(false)
	})
})
