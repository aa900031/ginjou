import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePermissions } from './permissions.svelte'

const mocks = vi.hoisted(() => ({
	createQuery: vi.fn(),
	createQueryEnabledFn: vi.fn(),
	createQueryFn: vi.fn(),
	createQueryKey: vi.fn(),
	useAuthzContext: vi.fn(),
	useQueryCallbacks: vi.fn(),
	useQueryClientContext: vi.fn(),
}))

vi.mock('@ginjou/core', () => ({
	Permissions: {
		createQueryEnabledFn: mocks.createQueryEnabledFn,
		createQueryFn: mocks.createQueryFn,
		createQueryKey: mocks.createQueryKey,
	},
}))

vi.mock('@tanstack/svelte-query', () => ({
	createQuery: mocks.createQuery,
}))

vi.mock('tanstack-query-callbacks/svelte', () => ({
	useQueryCallbacks: mocks.useQueryCallbacks,
}))

vi.mock('./authz', () => ({
	useAuthzContext: mocks.useAuthzContext,
}))

vi.mock('../query', () => ({
	useQueryClientContext: mocks.useQueryClientContext,
}))

describe('usePermissions', () => {
	beforeEach(() => {
		for (const mock of Object.values(mocks))
			mock.mockReset()

		mocks.createQuery.mockReturnValue({})
		mocks.createQueryEnabledFn.mockImplementation(({ getEnabled }) => {
			return () => getEnabled() !== false
		})
		mocks.createQueryFn.mockReturnValue(vi.fn())
		mocks.createQueryKey.mockReturnValue(['authz', 'permissions'])
		mocks.useAuthzContext.mockReturnValue({})
		mocks.useQueryClientContext.mockReturnValue({})
	})

	it('should preserve the previous enabled snapshot when accessor props change', () => {
		let isEnabled = $state(false)

		usePermissions(() => ({
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
