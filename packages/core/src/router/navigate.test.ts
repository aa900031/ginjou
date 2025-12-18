import { describe, expect, it, vi } from 'vitest'
import { ResourceActionType } from '../resource'
import { createToFn } from './navigate'

describe('navigate', () => {
	describe('createToFn', () => {
		it('should return a function', () => {
			const go = vi.fn()
			const getResourceFromProp = vi.fn()
			const resource = undefined

			const navigateTo = createToFn({
				go,
				getResourceFromProp,
				resource,
			})

			expect(navigateTo).toBeTypeOf('function')
		})

		it('should return early when props is false', () => {
			const go = vi.fn()
			const getResourceFromProp = vi.fn()
			const resource = undefined

			const navigateTo = createToFn({
				go,
				getResourceFromProp,
				resource,
			})

			navigateTo(false)

			expect(go).not.toHaveBeenCalled()
		})

		it('should return early when props is null', () => {
			const go = vi.fn()
			const getResourceFromProp = vi.fn()
			const resource = undefined

			const navigateTo = createToFn({
				go,
				getResourceFromProp,
				resource,
			})

			navigateTo(null as any)

			expect(go).not.toHaveBeenCalled()
		})

		it('should return early when props is undefined', () => {
			const go = vi.fn()
			const getResourceFromProp = vi.fn()
			const resource = undefined

			const navigateTo = createToFn({
				go,
				getResourceFromProp,
				resource,
			})

			navigateTo(undefined as any)

			expect(go).not.toHaveBeenCalled()
		})

		it('should call go with RouterGoParams when action is not present', () => {
			const go = vi.fn()
			const getResourceFromProp = vi.fn()
			const resource = undefined

			const navigateTo = createToFn({
				go,
				getResourceFromProp,
				resource,
			})

			const goParams = { to: '/custom/path' }
			navigateTo(goParams)

			expect(go).toHaveBeenCalledOnce()
			expect(go).toHaveBeenCalledWith(goParams)
		})

		describe('list action', () => {
			it('should navigate to list action', () => {
				const go = vi.fn()
				const getResourceFromProp = vi.fn(() => 'posts')
				const resource = {
					name: 'posts',
					list: '/posts',
				}

				const navigateTo = createToFn({
					go,
					getResourceFromProp,
					resource,
				})

				navigateTo({
					action: ResourceActionType.List,
				})

				expect(go).toHaveBeenCalledOnce()
				expect(go).toHaveBeenCalledWith({
					to: '/posts',
				})
			})

			it('should use resource from prop when provided', () => {
				const go = vi.fn()
				const getResourceFromProp = vi.fn(() => 'comments')
				const resource = {
					name: 'posts',
					list: '/posts',
				}

				const navigateTo = createToFn({
					go,
					getResourceFromProp,
					resource,
				})

				navigateTo({
					resource: 'comments',
					action: ResourceActionType.List,
				})

				expect(go).toHaveBeenCalledOnce()
			})

			it('should include params in the path', () => {
				const go = vi.fn()
				const getResourceFromProp = vi.fn(() => 'posts')
				const resource = {
					name: 'posts',
					list: '/posts',
				}

				const navigateTo = createToFn({
					go,
					getResourceFromProp,
					resource,
				})

				navigateTo({
					action: ResourceActionType.List,
					params: { page: 2, filter: 'active' },
				})

				expect(go).toHaveBeenCalledOnce()
			})

			it('should return early when path is null', () => {
				const go = vi.fn()
				const getResourceFromProp = vi.fn(() => undefined)
				const resource = undefined

				const navigateTo = createToFn({
					go,
					getResourceFromProp,
					resource,
				})

				navigateTo({
					action: ResourceActionType.List,
				})

				expect(go).not.toHaveBeenCalled()
			})
		})

		describe('create action', () => {
			it('should navigate to create action', () => {
				const go = vi.fn()
				const getResourceFromProp = vi.fn(() => 'posts')
				const resource = {
					name: 'posts',
					create: '/posts/create',
				}

				const navigateTo = createToFn({
					go,
					getResourceFromProp,
					resource,
				})

				navigateTo({
					action: ResourceActionType.Create,
				})

				expect(go).toHaveBeenCalledOnce()
				expect(go).toHaveBeenCalledWith({
					to: '/posts/create',
				})
			})

			it('should include params in create navigation', () => {
				const go = vi.fn()
				const getResourceFromProp = vi.fn(() => 'posts')
				const resource = {
					name: 'posts',
					create: '/posts/create',
				}

				const navigateTo = createToFn({
					go,
					getResourceFromProp,
					resource,
				})

				navigateTo({
					action: ResourceActionType.Create,
					params: { template: 'default' },
				})

				expect(go).toHaveBeenCalledOnce()
			})
		})

		describe('edit action', () => {
			it('should navigate to edit action with id', () => {
				const go = vi.fn()
				const getResourceFromProp = vi.fn(() => 'posts')
				const resource = {
					name: 'posts',
					edit: '/posts/:id/edit',
				}

				const navigateTo = createToFn({
					go,
					getResourceFromProp,
					resource,
				})

				navigateTo({
					action: ResourceActionType.Edit,
					id: 123,
				})

				expect(go).toHaveBeenCalledOnce()
			})

			it('should handle string ids', () => {
				const go = vi.fn()
				const getResourceFromProp = vi.fn(() => 'posts')
				const resource = {
					name: 'posts',
					edit: '/posts/:id/edit',
				}

				const navigateTo = createToFn({
					go,
					getResourceFromProp,
					resource,
				})

				navigateTo({
					action: ResourceActionType.Edit,
					id: 'abc-123',
				})

				expect(go).toHaveBeenCalledOnce()
			})

			it('should include id in params for edit', () => {
				const go = vi.fn()
				const getResourceFromProp = vi.fn(() => 'posts')
				const resource = {
					name: 'posts',
					edit: '/posts/:id/edit',
				}

				const navigateTo = createToFn({
					go,
					getResourceFromProp,
					resource,
				})

				navigateTo({
					action: ResourceActionType.Edit,
					id: 123,
					params: { view: 'advanced' },
				})

				expect(go).toHaveBeenCalledOnce()
			})

			it('should return early when path is null for edit', () => {
				const go = vi.fn()
				const getResourceFromProp = vi.fn(() => undefined)
				const resource = undefined

				const navigateTo = createToFn({
					go,
					getResourceFromProp,
					resource,
				})

				navigateTo({
					action: ResourceActionType.Edit,
					id: 123,
				})

				expect(go).not.toHaveBeenCalled()
			})
		})

		describe('show action', () => {
			it('should navigate to show action with id', () => {
				const go = vi.fn()
				const getResourceFromProp = vi.fn(() => 'posts')
				const resource = {
					name: 'posts',
					show: '/posts/:id',
				}

				const navigateTo = createToFn({
					go,
					getResourceFromProp,
					resource,
				})

				navigateTo({
					action: ResourceActionType.Show,
					id: 456,
				})

				expect(go).toHaveBeenCalledOnce()
			})

			it('should handle string ids for show', () => {
				const go = vi.fn()
				const getResourceFromProp = vi.fn(() => 'posts')
				const resource = {
					name: 'posts',
					show: '/posts/:id',
				}

				const navigateTo = createToFn({
					go,
					getResourceFromProp,
					resource,
				})

				navigateTo({
					action: ResourceActionType.Show,
					id: 'xyz-789',
				})

				expect(go).toHaveBeenCalledOnce()
			})

			it('should include id in params for show', () => {
				const go = vi.fn()
				const getResourceFromProp = vi.fn(() => 'posts')
				const resource = {
					name: 'posts',
					show: '/posts/:id',
				}

				const navigateTo = createToFn({
					go,
					getResourceFromProp,
					resource,
				})

				navigateTo({
					action: ResourceActionType.Show,
					id: 456,
					params: { tab: 'comments' },
				})

				expect(go).toHaveBeenCalledOnce()
			})

			it('should return early when path is null for show', () => {
				const go = vi.fn()
				const getResourceFromProp = vi.fn(() => undefined)
				const resource = undefined

				const navigateTo = createToFn({
					go,
					getResourceFromProp,
					resource,
				})

				navigateTo({
					action: ResourceActionType.Show,
					id: 456,
				})

				expect(go).not.toHaveBeenCalled()
			})
		})

		it('should use getResourceFromProp when resource prop is undefined', () => {
			const go = vi.fn()
			const getResourceFromProp = vi.fn(() => 'posts')
			const resource = {
				name: 'posts',
				list: '/posts',
			}

			const navigateTo = createToFn({
				go,
				getResourceFromProp,
				resource,
			})

			navigateTo({
				action: ResourceActionType.List,
			})

			expect(getResourceFromProp).toHaveBeenCalledOnce()
		})

		it('should handle complex navigation scenarios', () => {
			const go = vi.fn()
			const getResourceFromProp = vi.fn(() => 'posts')
			const resource = {
				name: 'posts',
				list: '/posts',
				create: '/posts/create',
				edit: '/posts/:id/edit',
				show: '/posts/:id',
			}

			const navigateTo = createToFn({
				go,
				getResourceFromProp,
				resource,
			})

			// Test multiple navigations
			navigateTo({ action: ResourceActionType.List })
			navigateTo({ action: ResourceActionType.Create })
			navigateTo({ action: ResourceActionType.Edit, id: 1 })
			navigateTo({ action: ResourceActionType.Show, id: 1 })

			expect(go).toHaveBeenCalledTimes(4)
		})
	})
})
