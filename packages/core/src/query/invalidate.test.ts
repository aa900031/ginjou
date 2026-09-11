import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { invalidate, InvalidateTarget, resolveInvalidateProps, triggerInvalidate, triggerInvalidates } from './invalidate'

describe('resolveInvalidateProps', () => {
	it('can extend the defaults', () => {
		expect(resolveInvalidateProps({
			invalidates: defaults => [
				...defaults,
				{ target: 'resource', resource: 'comments' },
			],
		}, ['list'])).toEqual({
			invalidates: [
				'list',
				{ target: 'resource', resource: 'comments' },
			],
		})
	})
})

describe('triggerInvalidate', () => {
	it('invalidates normal and infinite list caches together', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

		await triggerInvalidate(
			{ fetcherName: 'default', resource: 'posts', meta: { scope: 'admin' } } as any,
			InvalidateTarget.List,
			undefined,
			queryClient,
		)

		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['default', 'posts', 'getList'], type: 'all', refetchType: 'active' },
			{ cancelRefetch: false },
		)
		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['default', 'posts', 'getInfiniteList'], type: 'all', refetchType: 'active' },
			{ cancelRefetch: false },
		)
	})
})

describe('triggerInvalidates', () => {
	it('invalidates other resources and fetchers', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

		await triggerInvalidates({
			fetcherName: 'primary',
			resource: 'posts',
			id: 1,
			meta: { scope: 'admin' },
			invalidates: [
				{ target: 'resource', resource: 'comments' },
				{ target: 'one', resource: 'authors', ids: [2, 3] },
				{ target: 'all' },
			],
		}, { data: { id: 1 } }, queryClient)

		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['primary', 'comments'], type: 'all', refetchType: 'active' },
			{ cancelRefetch: false },
		)
		for (const id of [2, 3]) {
			expect(invalidateQueries).toHaveBeenCalledWith(
				{ queryKey: ['primary', 'authors', 'getOne', id, { meta: undefined }], type: 'all', refetchType: 'active' },
				{ cancelRefetch: false },
			)
		}
		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['primary'], type: 'all', refetchType: 'active' },
			{ cancelRefetch: false },
		)
	})
})

describe('invalidate', () => {
	it('uses the default fetcher', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

		await invalidate({ target: 'list', resource: 'posts' }, queryClient)

		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['default', 'posts', 'getList'], type: 'all', refetchType: 'active' },
			{ cancelRefetch: false },
		)
	})
})
