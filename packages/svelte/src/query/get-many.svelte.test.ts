import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGetMany } from './get-many.svelte'

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
	GetMany: {
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

describe('useGetMany', () => {
	beforeEach(() => {
		for (const mock of Object.values(mocks))
			mock.mockReset()

		mocks.createErrorHandler.mockReturnValue(vi.fn())
		mocks.createPlacholerDataFn.mockReturnValue(undefined)
		mocks.createQuery.mockReturnValue({ data: { data: [{ id: '1' }] } })
		mocks.createQueryEnabledFn.mockImplementation(({ getEnabled }) => {
			return () => getEnabled() !== false
		})
		mocks.createQueryFn.mockReturnValue(vi.fn())
		mocks.createQueryKey.mockReturnValue(['posts', 'getMany'])
		mocks.createSubscribeCallback.mockReturnValue(vi.fn())
		mocks.createSuccessHandler.mockReturnValue(vi.fn())
		mocks.getSubscribeChannel.mockReturnValue('resources/posts')
		mocks.getSubscribeParams.mockReturnValue({ resource: 'posts', type: 'many' })
		mocks.resolveQueryProps.mockImplementation(({ resource, ids }: { resource: string, ids: string[] }) => ({
			resource,
			ids,
			fetcherName: 'default',
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

		useGetMany(() => ({
			resource: 'posts',
			ids: ['1'],
			queryOptions: {
				enabled: isEnabled,
			},
		}))

		const getQueryOptions = mocks.createQuery.mock.calls[0][0]
		const disabledOptions = getQueryOptions()
		expect(disabledOptions.enabled()).toBe(false)

		isEnabled = true
		const enabledOptions = getQueryOptions()

		expect(enabledOptions.enabled()).toBe(true)
		expect(disabledOptions.enabled()).toBe(false)
	})
})
