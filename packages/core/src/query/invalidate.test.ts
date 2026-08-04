import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { InvalidateTarget, triggerInvalidate } from './invalidate'

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
