import type { BaseRecord, UpdateResult } from '../query'
import type { Navigate } from '../router'
import { describe, expect, it, vi } from 'vitest'
import { MutationMode } from '../query'
import { ResourceActionType } from '../resource'
import { createSaveFn, getId, getIsLoading } from './edit'

describe('edit controller', () => {
	describe('getId', () => {
		it('should return id from prop when provided', () => {
			const result = getId({
				resource: undefined,
				idFromProp: 123,
			})

			expect(result).toBe(123)
		})

		it('should return id from resource when action is edit and no prop provided', () => {
			const result = getId({
				resource: {
					action: 'edit',
					id: 456,
					resource: {
						name: 'posts',
					},
				},
				idFromProp: undefined,
			})

			expect(result).toBe(456)
		})

		it('should prefer id from prop over resource', () => {
			const result = getId({
				resource: {
					action: 'edit',
					id: 456,
					resource: {
						name: 'posts',
					},
				},
				idFromProp: 123,
			})

			expect(result).toBe(123)
		})

		it('should return empty string when no id is available', () => {
			const result = getId({
				resource: undefined,
				idFromProp: undefined,
			})

			expect(result).toBe('')
		})

		it('should return empty string when resource action is not edit', () => {
			const result = getId({
				resource: {
					name: 'posts',
					action: 'list',
				} as any,
				idFromProp: undefined,
			})

			expect(result).toBe('')
		})

		it('should handle string ids', () => {
			const result = getId({
				resource: undefined,
				idFromProp: 'abc-123',
			})

			expect(result).toBe('abc-123')
		})
	})

	describe('getIsLoading', () => {
		it('should return true when query is fetching', () => {
			const result = getIsLoading({
				isQueryFetching: true,
				isUpdatePending: false,
			})

			expect(result).toBe(true)
		})

		it('should return true when update is pending', () => {
			const result = getIsLoading({
				isQueryFetching: false,
				isUpdatePending: true,
			})

			expect(result).toBe(true)
		})

		it('should return true when both are true', () => {
			const result = getIsLoading({
				isQueryFetching: true,
				isUpdatePending: true,
			})

			expect(result).toBe(true)
		})

		it('should return false when both are false', () => {
			const result = getIsLoading({
				isQueryFetching: false,
				isUpdatePending: false,
			})

			expect(result).toBe(false)
		})
	})

	describe('createSaveFn', () => {
		const getQueryData = vi.fn(() => ({ data: { id: 1, title: 'origin' } }))

		it('should return a function', () => {
			const getId = vi.fn()
			const getResourceName = vi.fn()
			const getMutationMode = vi.fn()
			const getRedirect = vi.fn()
			const navigateTo = vi.fn()
			const mutateFn = vi.fn()

			const saveFn = createSaveFn({
				getId,
				getResourceName,
				getMutationMode,
				getRedirect,
				getQueryData,
				navigateTo,
				mutateFn,
			})

			expect(saveFn).toBeTypeOf('function')
		})

		describe('pessimistic mode', () => {
			it('should navigate after mutation success in pessimistic mode', async () => {
				const getId = vi.fn(() => 1)
				const getResourceName = vi.fn(() => 'posts')
				const getMutationMode = vi.fn(() => MutationMode.Pessimistic)
				const getRedirect = vi.fn(() => undefined)
				const navigateTo = vi.fn()

				const mockData: UpdateResult<BaseRecord> = {
					data: { id: 1, title: 'Updated' },
				}
				const mutateFn = vi.fn().mockImplementation((_, options) => {
					options?.onSuccess(mockData)
					return Promise.resolve(mockData)
				})

				const saveFn = createSaveFn({
					getId,
					getResourceName,
					getMutationMode,
					getQueryData,
					getRedirect,
					navigateTo,
					mutateFn,
				})

				await saveFn({ title: 'Updated' })

				expect(mutateFn).toHaveBeenCalledOnce()
				expect(navigateTo).toHaveBeenCalledOnce()
				expect(navigateTo).toHaveBeenCalledWith({
					resource: 'posts',
					action: ResourceActionType.Show,
					id: 1,
				})
			})

			it('should use default pessimistic mode when mode is undefined', async () => {
				const getId = vi.fn(() => 1)
				const getResourceName = vi.fn(() => 'posts')
				const getMutationMode = vi.fn(() => undefined)
				const getRedirect = vi.fn(() => undefined)
				const navigateTo = vi.fn()

				const mockData: UpdateResult<BaseRecord> = {
					data: { id: 1, title: 'Updated' },
				}
				const mutateFn = vi.fn().mockImplementation((_, options) => {
					options?.onSuccess(mockData)
					return Promise.resolve(mockData)
				})

				const saveFn = createSaveFn({
					getId,
					getResourceName,
					getMutationMode,
					getRedirect,
					getQueryData,
					navigateTo,
					mutateFn,
				})

				await saveFn({ title: 'Updated' })

				expect(navigateTo).toHaveBeenCalledOnce()
			})

			it('should not navigate before mutation in pessimistic mode', async () => {
				const getId = vi.fn(() => 1)
				const getResourceName = vi.fn(() => 'posts')
				const getMutationMode = vi.fn(() => MutationMode.Pessimistic)
				const getRedirect = vi.fn(() => undefined)
				const navigateTo = vi.fn()

				const mutateFn = vi.fn().mockImplementation(() => {
					// Check if navigateTo was called before this point
					expect(navigateTo).not.toHaveBeenCalled()
					return Promise.resolve({ data: { id: 1, title: 'Updated' } })
				})

				const saveFn = createSaveFn({
					getId,
					getResourceName,
					getMutationMode,
					getRedirect,
					getQueryData,
					navigateTo,
					mutateFn,
				})

				await saveFn({ title: 'Updated' })
			})
		})

		describe('optimistic mode', () => {
			it('should navigate immediately in optimistic mode', async () => {
				vi.useFakeTimers()
				const getId = vi.fn(() => 1)
				const getResourceName = vi.fn(() => 'posts')
				const getMutationMode = vi.fn(() => MutationMode.Optimistic)
				const getRedirect = vi.fn(() => undefined)
				const navigateTo = vi.fn()

				const mockData: UpdateResult<BaseRecord> = {
					data: { id: 1, title: 'Updated' },
				}
				const mutateFn = vi.fn().mockResolvedValue(mockData)

				const saveFn = createSaveFn({
					getId,
					getResourceName,
					getMutationMode,
					getRedirect,
					getQueryData,
					navigateTo,
					mutateFn,
				})

				const savePromise = saveFn({ title: 'Updated' })

				// Fast-forward timers
				await vi.runAllTimersAsync()
				await savePromise

				expect(navigateTo).toHaveBeenCalledOnce()
				expect(navigateTo).toHaveBeenCalledWith({
					resource: 'posts',
					action: ResourceActionType.Show,
					id: 1,
				})

				vi.useRealTimers()
			})

			it('should navigate with merged params data in optimistic mode', async () => {
				vi.useFakeTimers()
				const getId = vi.fn(() => 1)
				const getResourceName = vi.fn(() => 'posts')
				const getMutationMode = vi.fn(() => MutationMode.Optimistic)
				const getRedirect = vi.fn(() => undefined)
				const navigateTo = vi.fn()

				const mockData: UpdateResult<BaseRecord> = {
					data: { id: 1, title: 'Updated' },
				}
				const mutateFn = vi.fn().mockResolvedValue(mockData)

				const saveFn = createSaveFn({
					getId,
					getResourceName,
					getMutationMode,
					getRedirect,
					getQueryData,
					navigateTo,
					mutateFn,
				})

				const params = { title: 'Updated', status: 'published' }
				const savePromise = saveFn(params)

				await vi.runAllTimersAsync()
				await savePromise

				expect(navigateTo).toHaveBeenCalledWith({
					resource: 'posts',
					action: ResourceActionType.Show,
					id: 1,
				})

				vi.useRealTimers()
			})

			it('should still call mutateFn in optimistic mode', async () => {
				vi.useFakeTimers()
				const getId = vi.fn(() => 1)
				const getResourceName = vi.fn(() => 'posts')
				const getMutationMode = vi.fn(() => MutationMode.Optimistic)
				const getRedirect = vi.fn(() => undefined)
				const navigateTo = vi.fn()

				const mockData: UpdateResult<BaseRecord> = {
					data: { id: 1, title: 'Updated' },
				}
				const mutateFn = vi.fn().mockResolvedValue(mockData)

				const saveFn = createSaveFn({
					getId,
					getResourceName,
					getMutationMode,
					getRedirect,
					getQueryData,
					navigateTo,
					mutateFn,
				})

				const savePromise = saveFn({ title: 'Updated' })

				await vi.runAllTimersAsync()
				await savePromise

				expect(mutateFn).toHaveBeenCalledOnce()
				expect(mutateFn).toHaveBeenCalledWith(
					{ params: { title: 'Updated' } },
					expect.any(Object),
				)

				vi.useRealTimers()
			})
		})

		describe('undoable mode', () => {
			it('should navigate immediately in undoable mode', async () => {
				vi.useFakeTimers()
				const getId = vi.fn(() => 1)
				const getResourceName = vi.fn(() => 'posts')
				const getMutationMode = vi.fn(() => MutationMode.Undoable)
				const getRedirect = vi.fn(() => undefined)
				const navigateTo = vi.fn()

				const mockData: UpdateResult<BaseRecord> = {
					data: { id: 1, title: 'Updated' },
				}
				const mutateFn = vi.fn().mockResolvedValue(mockData)

				const saveFn = createSaveFn({
					getId,
					getResourceName,
					getMutationMode,
					getRedirect,
					getQueryData,
					navigateTo,
					mutateFn,
				})

				const savePromise = saveFn({ title: 'Updated' })

				await vi.runAllTimersAsync()
				await savePromise

				expect(navigateTo).toHaveBeenCalledOnce()

				vi.useRealTimers()
			})
		})

		describe('redirect options', () => {
			it('should navigate to list when redirect is list', async () => {
				const getId = vi.fn(() => 1)
				const getResourceName = vi.fn(() => 'posts')
				const getMutationMode = vi.fn(() => MutationMode.Pessimistic)
				const getRedirect = vi.fn(() => ResourceActionType.List)
				const navigateTo = vi.fn()

				const mockData: UpdateResult<BaseRecord> = {
					data: { id: 1, title: 'Updated' },
				}
				const mutateFn = vi.fn().mockImplementation((_, options) => {
					options?.onSuccess(mockData)
					return Promise.resolve(mockData)
				})

				const saveFn = createSaveFn({
					getId,
					getResourceName,
					getMutationMode,
					getRedirect,
					getQueryData,
					navigateTo,
					mutateFn,
				})

				await saveFn({ title: 'Updated' })

				expect(navigateTo).toHaveBeenCalledWith({
					resource: 'posts',
					action: ResourceActionType.List,
				})
			})

			it('should navigate to create when redirect is create', async () => {
				const getId = vi.fn(() => 1)
				const getResourceName = vi.fn(() => 'posts')
				const getMutationMode = vi.fn(() => MutationMode.Pessimistic)
				const getRedirect = vi.fn(() => ResourceActionType.Create)
				const navigateTo = vi.fn()
				const mockData: UpdateResult<BaseRecord> = {
					data: { id: 1, title: 'Updated' },
				}

				const mutateFn = vi.fn().mockImplementation((_, options) => {
					options?.onSuccess(mockData)
					return Promise.resolve(mockData)
				})

				const saveFn = createSaveFn({
					getId,
					getResourceName,
					getMutationMode,
					getRedirect,
					getQueryData,
					navigateTo,
					mutateFn,
				})

				await saveFn({ title: 'Updated' })

				expect(navigateTo).toHaveBeenCalledWith({
					resource: 'posts',
					action: ResourceActionType.Create,
				})
			})

			it('should navigate to edit when redirect is edit', async () => {
				const getId = vi.fn(() => 1)
				const getResourceName = vi.fn(() => 'posts')
				const getMutationMode = vi.fn(() => MutationMode.Pessimistic)
				const getRedirect = vi.fn(() => ResourceActionType.Edit)
				const navigateTo = vi.fn()

				const mockData: UpdateResult<BaseRecord> = {
					data: { id: 1, title: 'Updated' },
				}
				const mutateFn = vi.fn().mockImplementation((_, options) => {
					options?.onSuccess(mockData)
					return Promise.resolve(mockData)
				})

				const saveFn = createSaveFn({
					getId,
					getResourceName,
					getMutationMode,
					getRedirect,
					getQueryData,
					navigateTo,
					mutateFn,
				})

				await saveFn({ title: 'Updated' })

				expect(navigateTo).toHaveBeenCalledWith({
					resource: 'posts',
					action: ResourceActionType.Edit,
					id: 1,
				})
			})

			it('should use custom navigate props when redirect returns them', async () => {
				const getId = vi.fn(() => 1)
				const getResourceName = vi.fn(() => 'posts')
				const getMutationMode = vi.fn(() => MutationMode.Pessimistic)
				const customNavProps: Navigate.ToProps = {
					to: '/custom/path',
				}
				const getRedirect = vi.fn(() => () => customNavProps)

				const navigateTo = vi.fn()
				const mockData: UpdateResult<BaseRecord> = {
					data: { id: 1, title: 'Updated' },
				}
				const mutateFn = vi.fn().mockImplementation((_, options) => {
					options?.onSuccess(mockData)
					return Promise.resolve(mockData)
				})

				const saveFn = createSaveFn({
					getId,
					getResourceName,
					getMutationMode,
					getRedirect,
					getQueryData,
					navigateTo,
					mutateFn,
				})

				await saveFn({ title: 'Updated' })

				expect(navigateTo).toHaveBeenCalledWith(customNavProps)
			})

			it('should call redirect function with data', async () => {
				const getId = vi.fn(() => 1)
				const getResourceName = vi.fn(() => 'posts')
				const getMutationMode = vi.fn(() => MutationMode.Pessimistic)
				const redirectFn = vi.fn(() => ResourceActionType.List)
				const getRedirect = vi.fn(() => redirectFn)

				const navigateTo = vi.fn()
				const mockData: UpdateResult<BaseRecord> = {
					data: { id: 1, title: 'Updated' },
				}
				const mutateFn = vi.fn().mockImplementation((_, options) => {
					options?.onSuccess(mockData)
					return Promise.resolve(mockData)
				})

				const saveFn = createSaveFn({
					getId,
					getResourceName,
					getMutationMode,
					getRedirect,
					getQueryData,
					navigateTo,
					mutateFn,
				})

				await saveFn({ title: 'Updated' })

				expect(redirectFn).toHaveBeenCalledOnce()
				expect(redirectFn).toHaveBeenCalledWith(mockData)
			})
		})

		it('should return the result from mutateFn', async () => {
			const getId = vi.fn(() => 1)
			const getResourceName = vi.fn(() => 'posts')
			const getMutationMode = vi.fn(() => MutationMode.Pessimistic)
			const getRedirect = vi.fn(() => undefined)

			const navigateTo = vi.fn()
			const mockData: UpdateResult<BaseRecord> = {
				data: { id: 1, title: 'Updated' },
			}
			const mutateFn = vi.fn().mockResolvedValue(mockData)

			const saveFn = createSaveFn({
				getId,
				getResourceName,
				getMutationMode,
				getRedirect,
				getQueryData,
				navigateTo,
				mutateFn,
			})

			const result = await saveFn({ title: 'Updated' })

			expect(result).toEqual(mockData)
		})

		it('should handle mutation errors in pessimistic mode', async () => {
			const getId = vi.fn(() => 1)
			const getResourceName = vi.fn(() => 'posts')
			const getMutationMode = vi.fn(() => MutationMode.Pessimistic)
			const getRedirect = vi.fn(() => false as const)

			const navigateTo = vi.fn()
			const error = new Error('Update failed')
			const mutateFn = vi.fn().mockRejectedValue(error)

			const saveFn = createSaveFn({
				getId,
				getResourceName,
				getMutationMode,
				getRedirect,
				getQueryData,
				navigateTo,
				mutateFn,
			})

			await expect(saveFn({ title: 'Updated' })).rejects.toThrow('Update failed')
			expect(navigateTo).not.toHaveBeenCalled()
		})

		it('should handle mutation errors in optimistic mode', async () => {
			const getId = vi.fn(() => 1)
			const getResourceName = vi.fn(() => 'posts')
			const getMutationMode = vi.fn(() => MutationMode.Optimistic)
			const getRedirect = vi.fn(() => false as const)

			const navigateTo = vi.fn()
			const error = new Error('Update failed')
			const mutateFn = vi.fn().mockRejectedValue(error)

			const saveFn = createSaveFn({
				getId,
				getResourceName,
				getMutationMode,
				getRedirect,
				getQueryData,
				navigateTo,
				mutateFn,
			})

			const savePromise = saveFn({ title: 'Updated' })
			await expect(savePromise).rejects.toThrow('Update failed')
			await new Promise(resolve => setTimeout(resolve, 1))
			expect(navigateTo).toHaveBeenCalled()
		})

		it('should handle undefined resource name', async () => {
			const getId = vi.fn(() => 1)
			const getResourceName = vi.fn(() => undefined)
			const getMutationMode = vi.fn(() => MutationMode.Pessimistic)
			const getRedirect = vi.fn(() => undefined)

			const navigateTo = vi.fn()
			const mockData: UpdateResult<BaseRecord> = {
				data: { id: 1, title: 'Updated' },
			}
			const mutateFn = vi.fn().mockImplementation((_, options) => {
				options?.onSuccess(mockData)
				return Promise.resolve(mockData)
			})

			const saveFn = createSaveFn({
				getId,
				getResourceName,
				getMutationMode,
				getRedirect,
				getQueryData,
				navigateTo,
				mutateFn,
			})

			await saveFn({ title: 'Updated' })

			expect(navigateTo).toHaveBeenCalledWith({
				resource: undefined,
				action: ResourceActionType.Show,
				id: 1,
			})
		})

		it('should handle complex params with nested objects', async () => {
			const getId = vi.fn(() => 1)
			const getResourceName = vi.fn(() => 'posts')
			const getMutationMode = vi.fn(() => MutationMode.Pessimistic)
			const getRedirect = vi.fn(() => undefined)

			const navigateTo = vi.fn()
			const mockData: UpdateResult<BaseRecord> = {
				data: { id: 1, title: 'Updated', meta: { tags: ['a', 'b'] } },
			}
			const mutateFn = vi.fn().mockResolvedValue(mockData)

			const saveFn = createSaveFn({
				getId,
				getResourceName,
				getMutationMode,
				getRedirect,
				getQueryData,
				navigateTo,
				mutateFn,
			})

			const params = {
				title: 'Updated',
				meta: { tags: ['a', 'b'] },
			}
			await saveFn(params)

			expect(mutateFn).toHaveBeenCalledWith(
				{ params },
				expect.any(Object),
			)
		})

		it('should handle string ids correctly', async () => {
			const getId = vi.fn(() => 'abc-123')
			const getResourceName = vi.fn(() => 'posts')
			const getMutationMode = vi.fn(() => MutationMode.Pessimistic)
			const getRedirect = vi.fn(() => undefined)

			const navigateTo = vi.fn()
			const mockData: UpdateResult<BaseRecord> = {
				data: { id: 'abc-123', title: 'Updated' },
			}
			const mutateFn = vi.fn().mockImplementation((_, options) => {
				options?.onSuccess(mockData)
				return Promise.resolve(mockData)
			})

			const saveFn = createSaveFn({
				getId,
				getResourceName,
				getMutationMode,
				getRedirect,
				getQueryData,
				navigateTo,
				mutateFn,
			})

			await saveFn({ title: 'Updated' })

			expect(navigateTo).toHaveBeenCalledWith({
				resource: 'posts',
				action: ResourceActionType.Show,
				id: 'abc-123',
			})
		})
	})
})
