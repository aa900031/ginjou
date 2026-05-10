import type { Controller } from './controller'
import { describe, expect, it } from 'vitest'
import { defineController } from './controller'
import * as Resource from './resource'
import * as ResourceAction from './resource-action'
import * as ResourcePath from './resource-path'

describe('defineController', () => {
	it('should return the provided controller', () => {
		const controller = {
			resources: [],
		}

		expect(defineController(controller)).toBe(controller)
	})
})

describe('resourceResolver.get', () => {
	it('should return resource by name', () => {
		const controller: Controller = {
			resources: [
				{ name: 'posts' },
				{ name: 'comments' },
			],
		}

		expect(Resource.get(controller, 'comments')).toEqual({ name: 'comments' })
	})

	it('should return undefined when name is missing or unknown', () => {
		const controller: Controller = {
			resources: [
				{ name: 'posts' },
			],
		}

		expect(Resource.get(controller, undefined)).toBeUndefined()
		expect(Resource.get(controller, 'comments')).toBeUndefined()
	})
})

describe('resourceResolver.parse', () => {
	it('should parse list and create actions from string patterns', () => {
		const resource = {
			name: 'posts',
			list: '/posts',
			create: '/posts/create',
		}

		expect(Resource.parse(resource, { path: '/posts' })).toEqual({
			action: ResourceAction.Type.List,
		})
		expect(Resource.parse(resource, { path: '/posts/create' })).toEqual({
			action: ResourceAction.Type.Create,
		})
	})

	it('should parse edit and show ids from string patterns', () => {
		const resource = {
			name: 'posts',
			edit: '/posts/:id/edit',
			show: '/posts/:id',
		}

		expect(Resource.parse(resource, { path: '/posts/123/edit' })).toEqual({
			action: ResourceAction.Type.Edit,
			id: '123',
		})
		expect(Resource.parse(resource, { path: '/posts/456' })).toEqual({
			action: ResourceAction.Type.Show,
			id: '456',
		})
	})

	it('should use custom action parser', () => {
		const resource = {
			name: 'posts',
			show: {
				pattern: '/ignored',
				parse: () => ({
					action: ResourceAction.Type.Show,
					id: 'custom',
				}),
			},
		}

		expect(Resource.parse(resource, { path: '/anything' })).toEqual({
			action: ResourceAction.Type.Show,
			id: 'custom',
		})
	})
})

describe('resourceResolver.resolve', () => {
	it('should resolve resource by name', () => {
		const controller: Controller = {
			resources: [
				{ name: 'posts', show: '/posts/:id' },
			],
		}

		expect(Resource.resolve(controller, { name: 'posts' })).toEqual({
			resource: { name: 'posts', show: '/posts/:id' },
		})
	})

	it('should resolve resource and action by name with location', () => {
		const controller: Controller = {
			resources: [
				{ name: 'posts', show: '/posts/:id' },
			],
		}

		expect(Resource.resolve(controller, {
			name: 'posts',
			location: { path: '/posts/123' },
		})).toEqual({
			resource: { name: 'posts', show: '/posts/:id' },
			action: ResourceAction.Type.Show,
			id: '123',
		})
	})

	it('should infer resource from location when name is not provided', () => {
		const controller: Controller = {
			resources: [
				{ name: 'posts', show: '/posts/:id' },
				{ name: 'comments', show: '/comments/:id' },
			],
		}

		expect(Resource.resolve(controller, {
			location: { path: '/comments/abc' },
		})).toEqual({
			resource: { name: 'comments', show: '/comments/:id' },
			action: ResourceAction.Type.Show,
			id: 'abc',
		})
	})

	it('should return undefined when controller is missing', () => {
		expect(Resource.resolve(undefined, { name: 'posts' })).toBeUndefined()
	})
})

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

		expect(ResourcePath.get({
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

		expect(ResourcePath.get({
			resolved,
			action: ResourceAction.Type.Show,
			params: {
				tab: 'comments',
			},
		})).toBe('/posts/123/comments')
	})

	it('should return undefined when target pattern is missing', () => {
		expect(ResourcePath.get({
			resolved: {
				resource: { name: 'posts' },
				action: ResourceAction.Type.List,
			},
			action: ResourceAction.Type.List,
		})).toBeUndefined()
	})
})

describe('resourceResolver.getName', () => {
	it('should prefer explicit resource prop', () => {
		expect(Resource.getName({
			resource: {
				resource: { name: 'posts' },
				action: ResourceAction.Type.List,
			},
			resourceFromProp: 'comments',
		})).toBe('comments')
	})

	it('should fall back to resolved resource name', () => {
		expect(Resource.getName({
			resource: {
				resource: { name: 'posts' },
				action: ResourceAction.Type.List,
			},
		})).toBe('posts')
	})
})

describe('resourceResolver.getFetcherName', () => {
	it('should prefer explicit fetcher prop', () => {
		expect(Resource.getFetcherName({
			resource: {
				resource: {
					name: 'posts',
					meta: { fetcherName: 'resourceFetcher' },
				},
				action: ResourceAction.Type.List,
			},
			fetcherNameFromProp: 'propFetcher',
		})).toBe('propFetcher')
	})

	it('should fall back to resource metadata fetcher name', () => {
		expect(Resource.getFetcherName({
			resource: {
				resource: {
					name: 'posts',
					meta: { fetcherName: 'resourceFetcher' },
				},
				action: ResourceAction.Type.List,
			},
			fetcherNameFromProp: undefined,
		})).toBe('resourceFetcher')
	})
})
