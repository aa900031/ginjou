import { describe, expect, it } from 'vitest'
import { ResourceAction } from '.'
import { get } from './resource-path'

describe('resourcePath.get', () => {
	it('should create a path from a resolved resource', () => {
		const resolved = {
			resource: {
				name: 'posts',
				edit: '/posts/:id/edit',
			},
			action: ResourceAction.Type.Edit,
			id: '123',
		}

		expect(get({
			resolved,
			action: ResourceAction.Type.Edit,
		})).toBe('/posts/123/edit')
	})

	it('should merge provided params when creating a path', () => {
		const resolved = {
			resource: {
				name: 'posts',
				show: '/posts/:id/:tab',
			},
			action: ResourceAction.Type.Show,
			id: '123',
		}

		expect(get({
			resolved,
			action: ResourceAction.Type.Show,
			params: {
				tab: 'comments',
			},
		})).toBe('/posts/123/comments')
	})

	it('regression: should interpolate :action from the requested destination action instead of resolved.action', () => {
		const resolved = {
			resource: {
				name: 'posts',
				edit: '/posts/:id/:action',
				show: '/posts/:id',
			},
			action: ResourceAction.Type.Show,
			id: '123',
		}

		expect(get({
			resolved,
			action: ResourceAction.Type.Edit,
		})).toBe('/posts/123/edit')
	})

	it('regression: should allow params.action to override the requested destination action', () => {
		const resolved = {
			resource: {
				name: 'posts',
				edit: '/posts/:id/:action',
			},
			action: ResourceAction.Type.Show,
			id: '123',
		}

		expect(get({
			resolved,
			action: ResourceAction.Type.Edit,
			params: {
				action: 'preview',
			},
		})).toBe('/posts/123/preview')
	})

	it('should return undefined when target pattern is missing', () => {
		expect(get({
			resolved: {
				resource: { name: 'posts' },
				action: ResourceAction.Type.List,
			},
			action: ResourceAction.Type.List,
		})).toBeUndefined()
	})
})
