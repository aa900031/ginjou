import type { RuleOptions } from './invalidate'
import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { createInvalidator } from './invalidate'

describe('createInvalidator', () => {
	it('resolves invalidates when applying defaults', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const resolveInvalidates = vi.fn((): RuleOptions => ['list'])
		const invalidate = createInvalidator({
			getFetcherName: () => 'primary',
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			queryClient,
		})

		await invalidate({
			invalidates: resolveInvalidates,
		}, {
			invalidates: ['resource'],
		})

		expect(resolveInvalidates).toHaveBeenCalledWith(['resource'])
		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['primary', 'posts', 'getList'], type: 'all', refetchType: 'active' },
			{ cancelRefetch: false },
		)
		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['primary', 'posts', 'getInfiniteList'], type: 'all', refetchType: 'active' },
			{ cancelRefetch: false },
		)
	})

	it('uses broad keys for string one and many rules', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => undefined,
			queryClient,
		})

		await invalidate({
			invalidates: ['one', 'many'],
			resource: 'posts',
		})

		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['default', 'posts', 'getOne'], type: 'all', refetchType: 'active' },
			{ cancelRefetch: false },
		)
		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['default', 'posts', 'getMany'], type: 'all', refetchType: 'active' },
			{ cancelRefetch: false },
		)
	})

	it('uses exact keys for object one rules with id or ids', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => undefined,
			queryClient,
		})

		await invalidate({
			invalidates: [
				{ target: 'one', resource: 'authors', id: 1 },
				{ target: 'one', resource: 'authors', ids: [2, 3], fetcherName: 'legacy' },
			],
		})

		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['default', 'authors', 'getOne', 1, { meta: undefined }], type: 'all', refetchType: 'active' },
			{ cancelRefetch: false },
		)
		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['legacy', 'authors', 'getOne', 2, { meta: undefined }], type: 'all', refetchType: 'active' },
			{ cancelRefetch: false },
		)
		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['legacy', 'authors', 'getOne', 3, { meta: undefined }], type: 'all', refetchType: 'active' },
			{ cancelRefetch: false },
		)
	})

	it('lets call props override defaults and supports false', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => ['all'],
			getResource: () => undefined,
			queryClient,
		})

		await invalidate({ invalidates: false })

		expect(invalidateQueries).not.toHaveBeenCalled()
	})

	it('validates required props when executed', async () => {
		const queryClient = new QueryClient()
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => undefined,
			queryClient,
		})

		await expect(invalidate({})).rejects.toThrow('`invalidates` is required')
		await expect(invalidate({ invalidates: ['list'] })).rejects.toThrow('`resource` is required')
	})
})
