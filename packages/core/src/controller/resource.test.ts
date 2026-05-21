import type { Controller } from './controller'
import { describe, expect, it } from 'vitest'
import { ResourceAction } from '.'
import { get, getFetcherName, getName, parse, resolve } from './resource'

describe('resource.get', () => {
	it('should return resource by name', () => {
		const controller: Controller = {
			resources: [
				{ name: 'posts' },
				{ name: 'comments' },
			],
		}

		expect(get(controller, 'comments')).toEqual({ name: 'comments' })
	})

	it('should return undefined when name is missing or unknown', () => {
		const controller: Controller = {
			resources: [
				{ name: 'posts' },
			],
		}

		expect(get(controller, undefined)).toBeUndefined()
		expect(get(controller, 'comments')).toBeUndefined()
	})
})

describe('resource.parse', () => {
	it('should parse list and create actions from string patterns', () => {
		const resource = {
			name: 'posts',
			list: '/posts',
			create: '/posts/create',
		}

		expect(parse(resource, { path: '/posts' })).toEqual({
			action: ResourceAction.Type.List,
		})
		expect(parse(resource, { path: '/posts/create' })).toEqual({
			action: ResourceAction.Type.Create,
		})
	})

	it('should parse edit and show ids from string patterns', () => {
		const resource = {
			name: 'posts',
			edit: '/posts/:id/edit',
			show: '/posts/:id',
		}

		expect(parse(resource, { path: '/posts/123/edit' })).toEqual({
			action: ResourceAction.Type.Edit,
			id: '123',
		})
		expect(parse(resource, { path: '/posts/456' })).toEqual({
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

		expect(parse(resource, { path: '/anything' })).toEqual({
			action: ResourceAction.Type.Show,
			id: 'custom',
		})
	})

	it('should throw when show or edit patterns do not include an id parameter', () => {
		expect(() => parse({
			name: 'posts',
			show: '/posts/show',
		}, { path: '/posts/show' })).toThrow(`[@ginjou/core] Cannot parse '${ResourceAction.Type.Show}' resource route because the path pattern does not include an ':id' parameter.`)

		expect(() => parse({
			name: 'posts',
			edit: '/posts/edit',
		}, { path: '/posts/edit' })).toThrow(`[@ginjou/core] Cannot parse '${ResourceAction.Type.Edit}' resource route because the path pattern does not include an ':id' parameter.`)
	})

	it('should return undefined when no resource route matches the location', () => {
		expect(parse({
			name: 'posts',
			list: '/posts',
			show: '/posts/:id',
		}, { path: '/comments/123' })).toBeUndefined()
	})
})

describe('resource.resolve', () => {
	it('should resolve resource by name', () => {
		const controller: Controller = {
			resources: [
				{ name: 'posts', show: '/posts/:id' },
			],
		}

		expect(resolve(controller, { name: 'posts' })).toEqual({
			resource: { name: 'posts', show: '/posts/:id' },
		})
	})

	it('should resolve resource and action by name with location', () => {
		const controller: Controller = {
			resources: [
				{ name: 'posts', show: '/posts/:id' },
			],
		}

		expect(resolve(controller, {
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

		expect(resolve(controller, {
			location: { path: '/comments/abc' },
		})).toEqual({
			resource: { name: 'comments', show: '/comments/:id' },
			action: ResourceAction.Type.Show,
			id: 'abc',
		})
	})

	it('should return undefined when controller is missing', () => {
		expect(resolve(undefined, { name: 'posts' })).toBeUndefined()
	})
})

describe('resource.getName', () => {
	it('should prefer explicit resource prop', () => {
		expect(getName({
			resource: {
				resource: { name: 'posts' },
				action: ResourceAction.Type.List,
			},
			resourceFromProp: 'comments',
		})).toBe('comments')
	})

	it('should fall back to resolved resource name', () => {
		expect(getName({
			resource: {
				resource: { name: 'posts' },
				action: ResourceAction.Type.List,
			},
		})).toBe('posts')
	})
})

describe('resource.getFetcherName', () => {
	it('should prefer explicit fetcher prop', () => {
		expect(getFetcherName({
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
		expect(getFetcherName({
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
