import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCustom } from './custom.svelte'

const mocks = vi.hoisted(() => ({
	createQuery: vi.fn(),
	createQueryEnabledFn: vi.fn(),
	createQueryFn: vi.fn(),
	createQueryKey: vi.fn(),
	createSuccessHandler: vi.fn(),
	createErrorHandler: vi.fn(),
	resolveQueryProps: vi.fn(),
	useCheckError: vi.fn(),
	useFetchersContext: vi.fn(),
	useNotify: vi.fn(),
	useQueryCallbacks: vi.fn(),
	useQueryClientContext: vi.fn(),
	useSubscribe: vi.fn(),
	useTranslate: vi.fn(),
}))

vi.mock('@ginjou/core', () => ({
	RealtimeAction: {
		Any: 'any',
	},
	Custom: {
		createErrorHandler: mocks.createErrorHandler,
		createQueryEnabledFn: mocks.createQueryEnabledFn,
		createQueryFn: mocks.createQueryFn,
		createQueryKey: mocks.createQueryKey,
		createSuccessHandler: mocks.createSuccessHandler,
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
	useSubscribe: mocks.useSubscribe,
}))

vi.mock('./fetchers', () => ({
	useFetchersContext: mocks.useFetchersContext,
}))

vi.mock('./query-client', () => ({
	useQueryClientContext: mocks.useQueryClientContext,
}))

describe('useCustom', () => {
	beforeEach(() => {
		for (const mock of Object.values(mocks))
			mock.mockReset()

		mocks.createErrorHandler.mockReturnValue(vi.fn())
		mocks.createQuery.mockReturnValue({ data: { data: { id: '1' } } })
		mocks.createQueryEnabledFn.mockImplementation(({ getEnabled }) => {
			return () => getEnabled() !== false
		})
		mocks.createQueryFn.mockReturnValue(vi.fn())
		mocks.createQueryKey.mockReturnValue(['custom'])
		mocks.createSuccessHandler.mockReturnValue(vi.fn())
		mocks.resolveQueryProps.mockImplementation((props: any) => ({
			...props,
			fetcherName: 'default',
		}))
		mocks.useCheckError.mockReturnValue({ mutateAsync: vi.fn() })
		mocks.useFetchersContext.mockReturnValue({})
		mocks.useNotify.mockReturnValue({})
		mocks.useQueryClientContext.mockReturnValue({})
		mocks.useTranslate.mockReturnValue(vi.fn())
	})

	it('should preserve the previous enabled snapshot when accessor props change', () => {
		let isEnabled = $state(false)

		useCustom(() => ({
			url: '/posts/1',
			method: 'get',
			queryOptions: {
				enabled: isEnabled,
			},
		}) as any)

		const getQueryOptions = mocks.createQuery.mock.calls[0][0]
		const disabledOptions = getQueryOptions()
		expect(disabledOptions.enabled()).toBe(false)

		isEnabled = true
		const enabledOptions = getQueryOptions()

		expect(enabledOptions.enabled()).toBe(true)
		expect(disabledOptions.enabled()).toBe(false)
	})
})
