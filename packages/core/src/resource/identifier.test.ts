import type { ResolvedResource } from './resolve'
import { describe, expect, it } from 'vitest'
import { getResourceIdentifier } from './identifier'

describe('getResourceIdentifier', () => {
	it('should return resourceFromProp if it is provided', () => {
		const resource: ResolvedResource = {
			resource: {
				name: 'posts',
			},
			id: '123',
			action: 'show',
		}
		const resourceFromProp = 'articles'
		const identifier = getResourceIdentifier({ resource, resourceFromProp })
		expect(identifier).toBe(resourceFromProp)
	})

	it('should return resource name if resourceFromProp is not provided', () => {
		const resource: ResolvedResource = {
			resource: {
				name: 'posts',
			},
			id: '123',
			action: 'show',
		}
		const identifier = getResourceIdentifier({ resource })
		expect(identifier).toBe('posts')
	})

	it('should return undefined if both resource and resourceFromProp are not provided', () => {
		const identifier = getResourceIdentifier({
			resource: undefined,
		})
		expect(identifier).toBeUndefined()
	})

	it('should return resourceFromProp even if it is an empty string', () => {
		const resource: ResolvedResource = {
			resource: {
				name: 'posts',
			},
			id: '123',
			action: 'show',
		}
		const resourceFromProp = ''
		const identifier = getResourceIdentifier({ resource, resourceFromProp })
		expect(identifier).toBe('')
	})

	it('should return resourceFromProp if resource is not provided', () => {
		const resourceFromProp = 'articles'
		const identifier = getResourceIdentifier({
			resource: undefined,
			resourceFromProp,
		})
		expect(identifier).toBe(resourceFromProp)
	})
})
