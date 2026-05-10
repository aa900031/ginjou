import { describe, expect, it, vi } from 'vitest'
import { ResourceAction } from '.'
import { redirectTo } from './redirect-to'

describe('redirectTo', () => {
	it('should navigate to list and create actions without id', () => {
		const navigateTo = vi.fn()

		redirectTo({
			redirect: ResourceAction.Type.List,
			resource: 'posts',
			id: undefined,
			data: { id: '1' },
			navigateTo,
		})

		redirectTo({
			redirect: ResourceAction.Type.Create,
			resource: 'posts',
			id: undefined,
			data: { id: '1' },
			navigateTo,
		})

		expect(navigateTo).toHaveBeenNthCalledWith(1, {
			resource: 'posts',
			action: ResourceAction.Type.List,
		})
		expect(navigateTo).toHaveBeenNthCalledWith(2, {
			resource: 'posts',
			action: ResourceAction.Type.Create,
		})
	})

	it('should navigate to show and edit actions with id', () => {
		const navigateTo = vi.fn()

		redirectTo({
			redirect: ResourceAction.Type.Show,
			resource: 'posts',
			id: '123',
			data: { id: '123' },
			navigateTo,
		})

		redirectTo({
			redirect: ResourceAction.Type.Edit,
			resource: 'posts',
			id: '123',
			data: { id: '123' },
			navigateTo,
		})

		expect(navigateTo).toHaveBeenNthCalledWith(1, {
			resource: 'posts',
			action: ResourceAction.Type.Show,
			id: '123',
		})
		expect(navigateTo).toHaveBeenNthCalledWith(2, {
			resource: 'posts',
			action: ResourceAction.Type.Edit,
			id: '123',
		})
	})

	it('should not navigate to show or edit actions when id is missing', () => {
		const navigateTo = vi.fn()

		redirectTo({
			redirect: ResourceAction.Type.Show,
			resource: 'posts',
			id: undefined,
			data: { id: '123' },
			navigateTo,
		})

		redirectTo({
			redirect: ResourceAction.Type.Edit,
			resource: 'posts',
			id: undefined,
			data: { id: '123' },
			navigateTo,
		})

		expect(navigateTo).not.toHaveBeenCalled()
	})

	it('should pass custom navigate props through directly', () => {
		const navigateTo = vi.fn()
		const redirect = {
			to: '/custom/path',
			replace: true,
		} as const

		redirectTo({
			redirect,
			resource: 'posts',
			id: '123',
			data: { id: '123' },
			navigateTo,
		})

		expect(navigateTo).toHaveBeenCalledWith(redirect)
	})

	it('should resolve redirect from a callback using data', () => {
		const navigateTo = vi.fn()
		const data = { id: '123', published: true }
		const redirect = vi.fn((result: typeof data) => result.published
			? ResourceAction.Type.Show
			: ResourceAction.Type.Edit)

		redirectTo({
			redirect,
			resource: 'posts',
			id: '123',
			data,
			navigateTo,
		})

		expect(redirect).toHaveBeenCalledOnce()
		expect(redirect).toHaveBeenCalledWith(data)
		expect(navigateTo).toHaveBeenCalledWith({
			resource: 'posts',
			action: ResourceAction.Type.Show,
			id: '123',
		})
	})

	it('should allow redirect callbacks to return custom navigate props', () => {
		const navigateTo = vi.fn()
		const redirect = vi.fn(() => ({
			to: '/custom/path',
		}))

		redirectTo({
			redirect,
			resource: 'posts',
			id: '123',
			data: { id: '123' },
			navigateTo,
		})

		expect(navigateTo).toHaveBeenCalledWith({
			to: '/custom/path',
		})
	})
})
