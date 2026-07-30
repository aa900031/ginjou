import type { BaseRecord, CreateResult } from '../query'
import { describe, expect, it, vi } from 'vitest'
import { createSaveFn, getId, getIsLoading } from './clone'
import * as ResourceAction from './resource-action'

describe('clone controller', () => {
	it('should prefer the id prop over the clone route id', () => {
		expect(getId({
			resource: {
				action: ResourceAction.Type.Clone,
				id: 'route-id',
				resource: { name: 'posts' },
			},
			idFromProp: 'prop-id',
		})).toBe('prop-id')
	})

	it('should use the clone route id when the id prop is missing', () => {
		expect(getId({
			resource: {
				action: ResourceAction.Type.Clone,
				id: 'route-id',
				resource: { name: 'posts' },
			},
			idFromProp: undefined,
		})).toBe('route-id')
	})

	it('should be loading while the source query or create mutation is active', () => {
		expect(getIsLoading({
			isQueryFetching: true,
			isCreatePending: false,
		})).toBe(true)
		expect(getIsLoading({
			isQueryFetching: false,
			isCreatePending: true,
		})).toBe(true)
		expect(getIsLoading({
			isQueryFetching: false,
			isCreatePending: false,
		})).toBe(false)
	})

	it('should preserve params, warn about an id, and redirect to list', async () => {
		const result: CreateResult<BaseRecord> = {
			data: { id: 'copy-id', title: 'Copy' },
		}
		const navigateTo = vi.fn()
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const mutateFn = vi.fn().mockImplementation((_, options) => {
			options?.onSuccess(result)
			return Promise.resolve(result)
		})
		const save = createSaveFn({
			navigateTo,
			getResourceName: () => 'posts',
			getRedirect: () => undefined,
			mutateFn,
		})
		const params = { id: 'source-id', title: 'Copy' }

		await save(params)

		expect(warn).toHaveBeenCalledOnce()
		expect(mutateFn).toHaveBeenCalledWith(
			{ params },
			expect.objectContaining({ onSuccess: expect.any(Function) }),
		)
		expect(navigateTo).toHaveBeenCalledWith({
			resource: 'posts',
			action: ResourceAction.Type.List,
		})

		warn.mockRestore()
	})

	it('should honor an explicit clone redirect with the created id', async () => {
		const result: CreateResult<BaseRecord> = {
			data: { id: 'copy-id' },
		}
		const navigateTo = vi.fn()
		const save = createSaveFn({
			navigateTo,
			getResourceName: () => 'posts',
			getRedirect: () => ResourceAction.Type.Clone,
			mutateFn: vi.fn().mockImplementation((_, options) => {
				options?.onSuccess(result)
				return Promise.resolve(result)
			}),
		})

		await save({ title: 'Copy' })

		expect(navigateTo).toHaveBeenCalledWith({
			resource: 'posts',
			action: ResourceAction.Type.Clone,
			id: 'copy-id',
		})
	})
})
