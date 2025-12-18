import type { BaseRecord, CreateResult } from '../query'
import type { Navigate } from '../router'
import { describe, expect, it, vi } from 'vitest'
import { ResourceActionType } from '../resource'
import { createSaveFn, getIsLoading } from './create'

describe('create controller', () => {
	describe('getIsLoading', () => {
		it('should return true when isPending is true', () => {
			const result = getIsLoading({
				isPending: true,
			})

			expect(result).toBe(true)
		})

		it('should return false when isPending is false', () => {
			const result = getIsLoading({
				isPending: false,
			})

			expect(result).toBe(false)
		})
	})

	describe('createSaveFn', () => {
		it('should return a function', () => {
			const navigateTo = vi.fn()
			const getResourceName = vi.fn()
			const getRedirect = vi.fn()
			const mutateFn = vi.fn()

			const saveFn = createSaveFn({
				navigateTo,
				getResourceName,
				getRedirect,
				mutateFn,
			})

			expect(saveFn).toBeTypeOf('function')
		})

		it('should call mutateFn with params', async () => {
			const navigateTo = vi.fn()
			const getResourceName = vi.fn(() => 'posts')
			const getRedirect = vi.fn(() => undefined)
			const mutateFn = vi.fn().mockResolvedValue({
				data: { id: 1, title: 'Test' },
			})

			const saveFn = createSaveFn({
				navigateTo,
				getResourceName,
				getRedirect,
				mutateFn,
			})

			const params = { title: 'Test' }
			await saveFn(params)

			expect(mutateFn).toHaveBeenCalledOnce()
			expect(mutateFn).toHaveBeenCalledWith(
				{ params },
				expect.objectContaining({
					onSuccess: expect.any(Function),
				}),
			)
		})

		it('should call navigateTo with list action by default on success', async () => {
			const navigateTo = vi.fn()
			const getResourceName = vi.fn(() => 'posts')
			const getRedirect = vi.fn(() => undefined)
			const mockData: CreateResult<BaseRecord> = {
				data: { id: 1, title: 'Test' },
			}
			const mutateFn = vi.fn().mockImplementation((_, options) => {
				options?.onSuccess(mockData)
				return Promise.resolve(mockData)
			})

			const saveFn = createSaveFn({
				navigateTo,
				getResourceName,
				getRedirect,
				mutateFn,
			})

			await saveFn({ title: 'Test' })

			expect(navigateTo).toHaveBeenCalledOnce()
			expect(navigateTo).toHaveBeenCalledWith({
				resource: 'posts',
				action: ResourceActionType.List,
			})
		})

		it('should call navigateTo with create action when redirect is create', async () => {
			const navigateTo = vi.fn()
			const getResourceName = vi.fn(() => 'posts')
			const getRedirect = vi.fn(() => ResourceActionType.Create)
			const mockData: CreateResult<BaseRecord> = {
				data: { id: 1, title: 'Test' },
			}
			const mutateFn = vi.fn().mockImplementation((_, options) => {
				options?.onSuccess(mockData)
				return Promise.resolve(mockData)
			})

			const saveFn = createSaveFn({
				navigateTo,
				getResourceName,
				getRedirect,
				mutateFn,
			})

			await saveFn({ title: 'Test' })

			expect(navigateTo).toHaveBeenCalledOnce()
			expect(navigateTo).toHaveBeenCalledWith({
				resource: 'posts',
				action: ResourceActionType.Create,
			})
		})

		it('should call navigateTo with edit action when redirect is edit', async () => {
			const navigateTo = vi.fn()
			const getResourceName = vi.fn(() => 'posts')
			const getRedirect = vi.fn(() => ResourceActionType.Edit)
			const mockData: CreateResult<BaseRecord> = {
				data: { id: 1, title: 'Test' },
			}
			const mutateFn = vi.fn().mockImplementation((_, options) => {
				options?.onSuccess(mockData)
				return Promise.resolve(mockData)
			})

			const saveFn = createSaveFn({
				navigateTo,
				getResourceName,
				getRedirect,
				mutateFn,
			})

			await saveFn({ title: 'Test' })

			expect(navigateTo).toHaveBeenCalledOnce()
			expect(navigateTo).toHaveBeenCalledWith({
				resource: 'posts',
				action: ResourceActionType.Edit,
				id: 1,
			})
		})

		it('should call navigateTo with show action when redirect is show', async () => {
			const navigateTo = vi.fn()
			const getResourceName = vi.fn(() => 'posts')
			const getRedirect = vi.fn(() => ResourceActionType.Show)
			const mockData: CreateResult<BaseRecord> = {
				data: { id: 1, title: 'Test' },
			}
			const mutateFn = vi.fn().mockImplementation((_, options) => {
				options?.onSuccess(mockData)
				return Promise.resolve(mockData)
			})

			const saveFn = createSaveFn({
				navigateTo,
				getResourceName,
				getRedirect,
				mutateFn,
			})

			await saveFn({ title: 'Test' })

			expect(navigateTo).toHaveBeenCalledOnce()
			expect(navigateTo).toHaveBeenCalledWith({
				resource: 'posts',
				action: ResourceActionType.Show,
				id: 1,
			})
		})

		it('should call navigateTo with custom navigate props when redirect returns navigate props', async () => {
			const navigateTo = vi.fn()
			const getResourceName = vi.fn(() => 'posts')
			const customNavProps: Navigate.ToProps = {
				to: '/custom/path',
			}
			const getRedirect = vi.fn(() => () => customNavProps)
			const mockData: CreateResult<BaseRecord> = {
				data: { id: 1, title: 'Test' },
			}
			const mutateFn = vi.fn().mockImplementation((_, options) => {
				options?.onSuccess(mockData)
				return Promise.resolve(mockData)
			})

			const saveFn = createSaveFn({
				navigateTo,
				getResourceName,
				getRedirect,
				mutateFn,
			})

			await saveFn({ title: 'Test' })

			expect(navigateTo).toHaveBeenCalledOnce()
			expect(navigateTo).toHaveBeenCalledWith(customNavProps)
		})

		it('should call redirect function with data', async () => {
			const navigateTo = vi.fn()
			const getResourceName = vi.fn(() => 'posts')
			const redirectFn = vi.fn(() => ResourceActionType.List)
			const getRedirect = vi.fn(() => redirectFn)
			const mockData: CreateResult<BaseRecord> = {
				data: { id: 1, title: 'Test' },
			}
			const mutateFn = vi.fn().mockImplementation((_, options) => {
				options?.onSuccess(mockData)
				return Promise.resolve(mockData)
			})

			const saveFn = createSaveFn({
				navigateTo,
				getResourceName,
				getRedirect,
				mutateFn,
			})

			await saveFn({ title: 'Test' })

			expect(redirectFn).toHaveBeenCalledOnce()
			expect(redirectFn).toHaveBeenCalledWith(mockData)
		})

		it('should handle redirect function returning different actions based on data', async () => {
			const navigateTo = vi.fn()
			const getResourceName = vi.fn(() => 'posts')
			const redirectFn = vi.fn((data: CreateResult<BaseRecord>) => {
				return data.data.id ? ResourceActionType.Edit : ResourceActionType.List
			})
			const getRedirect = vi.fn(() => redirectFn)
			const mockData: CreateResult<BaseRecord> = {
				data: { id: 1, title: 'Test' },
			}
			const mutateFn = vi.fn().mockImplementation((_, options) => {
				options?.onSuccess(mockData)
				return Promise.resolve(mockData)
			})

			const saveFn = createSaveFn({
				navigateTo,
				getResourceName,
				getRedirect,
				mutateFn,
			})

			await saveFn({ title: 'Test' })

			expect(navigateTo).toHaveBeenCalledWith({
				resource: 'posts',
				action: ResourceActionType.Edit,
				id: 1,
			})
		})

		it('should handle undefined resource name', async () => {
			const navigateTo = vi.fn()
			const getResourceName = vi.fn(() => undefined)
			const getRedirect = vi.fn(() => undefined)
			const mockData: CreateResult<BaseRecord> = {
				data: { id: 1, title: 'Test' },
			}
			const mutateFn = vi.fn().mockImplementation((_, options) => {
				options?.onSuccess(mockData)
				return Promise.resolve(mockData)
			})

			const saveFn = createSaveFn({
				navigateTo,
				getResourceName,
				getRedirect,
				mutateFn,
			})

			await saveFn({ title: 'Test' })

			expect(navigateTo).toHaveBeenCalledOnce()
			expect(navigateTo).toHaveBeenCalledWith({
				resource: undefined,
				action: ResourceActionType.List,
			})
		})

		it('should return the result from mutateFn', async () => {
			const navigateTo = vi.fn()
			const getResourceName = vi.fn(() => 'posts')
			const getRedirect = vi.fn(() => undefined)
			const mockData: CreateResult<BaseRecord> = {
				data: { id: 1, title: 'Test' },
			}
			const mutateFn = vi.fn().mockResolvedValue(mockData)

			const saveFn = createSaveFn({
				navigateTo,
				getResourceName,
				getRedirect,
				mutateFn,
			})

			const result = await saveFn({ title: 'Test' })

			expect(result).toEqual(mockData)
		})

		it('should handle mutation errors', async () => {
			const navigateTo = vi.fn()
			const getResourceName = vi.fn(() => 'posts')
			const getRedirect = vi.fn(() => undefined)
			const error = new Error('Mutation failed')
			const mutateFn = vi.fn().mockRejectedValue(error)

			const saveFn = createSaveFn({
				navigateTo,
				getResourceName,
				getRedirect,
				mutateFn,
			})

			await expect(saveFn({ title: 'Test' })).rejects.toThrow('Mutation failed')
			expect(navigateTo).not.toHaveBeenCalled()
		})

		it('should handle complex params with nested objects', async () => {
			const navigateTo = vi.fn()
			const getResourceName = vi.fn(() => 'posts')
			const getRedirect = vi.fn(() => undefined)
			const mockData: CreateResult<BaseRecord> = {
				data: { id: 1, title: 'Test', meta: { tags: ['a', 'b'] } },
			}
			const mutateFn = vi.fn().mockResolvedValue(mockData)

			const saveFn = createSaveFn({
				navigateTo,
				getResourceName,
				getRedirect,
				mutateFn,
			})

			const params = {
				title: 'Test',
				meta: { tags: ['a', 'b'] },
			}
			await saveFn(params)

			expect(mutateFn).toHaveBeenCalledWith(
				{ params },
				expect.any(Object),
			)
		})

		it('should handle data without id field for list/create redirects', async () => {
			const navigateTo = vi.fn()
			const getResourceName = vi.fn(() => 'posts')
			const getRedirect = vi.fn(() => ResourceActionType.List)
			const mockData: CreateResult<BaseRecord> = {
				data: { title: 'Test' }, // No id
			}
			const mutateFn = vi.fn().mockImplementation((_, options) => {
				options?.onSuccess(mockData)
				return Promise.resolve(mockData)
			})

			const saveFn = createSaveFn({
				navigateTo,
				getResourceName,
				getRedirect,
				mutateFn,
			})

			await saveFn({ title: 'Test' })

			expect(navigateTo).toHaveBeenCalledWith({
				resource: 'posts',
				action: ResourceActionType.List,
			})
		})

		it('should not call navigateTo on mutation failure', async () => {
			const navigateTo = vi.fn()
			const getResourceName = vi.fn(() => 'posts')
			const getRedirect = vi.fn(() => undefined)
			const mutateFn = vi.fn().mockRejectedValue(new Error('Failed'))

			const saveFn = createSaveFn({
				navigateTo,
				getResourceName,
				getRedirect,
				mutateFn,
			})

			await expect(saveFn({ title: 'Test' })).rejects.toThrow()
			expect(navigateTo).not.toHaveBeenCalled()
		})
	})
})
