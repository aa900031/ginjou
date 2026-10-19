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

		expect(resolveInvalidates).toHaveBeenCalledWith(['resource'], {
			data: undefined,
			props: { invalidates: resolveInvalidates },
		})
		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['primary', 'posts', 'getList'], type: 'all', refetchType: 'active' },
			{ cancelRefetch: false },
		)
		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['primary', 'posts', 'getInfiniteList'], type: 'all', refetchType: 'active' },
			{ cancelRefetch: false },
		)
	})

	it('uses exact keys from mutation props and result data for string one and many rules', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => undefined,
			queryClient,
		})

		const mutationProps = {
			invalidates: ['one', 'many'] as RuleOptions,
			resource: 'posts',
			ids: [1, 2],
			meta: { lang: 'en' },
		}
		await invalidate(mutationProps, undefined, {
			data: { data: [{ id: 2 }, { id: 3 }] },
		})

		const filters = { type: 'all', refetchType: 'active' }
		const options = { cancelRefetch: false }
		const meta = { lang: 'en' }
		expect(invalidateQueries).toHaveBeenCalledTimes(5)
		for (const id of [1, 2, 3])
			expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['default', 'posts', 'getOne', id, { meta }], ...filters }, options)
		expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['default', 'posts', 'getMany', ['1', '2'], { meta }], ...filters }, options)
		expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['default', 'posts', 'getMany', ['2', '3'], { meta }], ...filters }, options)
	})

	it('merges single props id and result id for string one rule', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			queryClient,
		})

		const mutationProps = { invalidates: ['one', 'many'] as RuleOptions, id: 1 }
		await invalidate(mutationProps, undefined, {
			data: { data: { id: 4 } },
		})

		expect(invalidateQueries).toHaveBeenCalledTimes(2)
		expect(invalidateQueries.mock.calls.map(([filters]) => filters!.queryKey)).toEqual([
			['default', 'posts', 'getOne', 1, { meta: undefined }],
			['default', 'posts', 'getOne', 4, { meta: undefined }],
		])
	})

	it('requires mutation context for string one and many rules', async () => {
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			queryClient: new QueryClient(),
		})

		await expect(invalidate({ invalidates: ['one'] })).rejects.toThrow('Mutation context is required')
		await expect(invalidate({ invalidates: ['many'] })).rejects.toThrow('Mutation context is required')
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

	it('supports object rule options and replaces default filters and options', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			queryClient,
		})

		await invalidate({
			invalidates: {
				rules: ['resource'],
				queryFilters: { refetchType: 'all' },
				options: { throwOnError: true },
			},
		})

		expect(invalidateQueries).toHaveBeenCalledOnce()
		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['default', 'posts'], refetchType: 'all' },
			{ throwOnError: true },
		)
	})

	it('skips object rule options with false or empty rules', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => ({ rules: false }),
			getResource: () => 'posts',
			queryClient,
		})

		await invalidate({}, { invalidates: ['list'] })
		await invalidate({ invalidates: { rules: [] } })

		expect(invalidateQueries).not.toHaveBeenCalled()
	})

	it('passes plain defaults to the resolve function and accepts object result', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const invalidate = createInvalidator({
			getFetcherName: () => undefined,
			getInvalidates: () => undefined,
			getResource: () => 'posts',
			queryClient,
		})

		await invalidate({
			invalidates: defaults => ({
				rules: [...(defaults || []), { target: 'resource', resource: 'comments' }],
				queryFilters: { type: 'active' },
			}),
		}, { invalidates: ['list'] })

		expect(invalidateQueries.mock.calls.map(([filters]) => filters)).toEqual([
			{ queryKey: ['default', 'posts', 'getList'], type: 'active' },
			{ queryKey: ['default', 'posts', 'getInfiniteList'], type: 'active' },
			{ queryKey: ['default', 'comments'], type: 'active' },
		])
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
