import { describe, expect, it } from 'vitest'
import { getDefaultId } from './show'

describe('getDefaultId', () => {
	it('should prefer id from prop when provided', () => {
		expect(getDefaultId({
			resourceFromProp: undefined,
			idFromProp: 'prop-id',
			resource: {
				resource: { name: 'posts' },
				action: 'show',
				id: 'resource-id',
			},
			inferredResource: {
				resource: { name: 'posts' },
				action: 'show',
				id: 'resource-id',
			},
		})).toBe('prop-id')
	})

	it('should return prop id when resource prop does not match inferred resource name', () => {
		expect(getDefaultId({
			resourceFromProp: 'comments',
			idFromProp: 'prop-id',
			resource: {
				resource: { name: 'posts' },
				action: 'show',
				id: 'resource-id',
			},
			inferredResource: {
				resource: { name: 'posts' },
				action: 'show',
				id: 'resource-id',
			},
		})).toBe('prop-id')
	})

	it('should fall back to show resource id when prop id is missing', () => {
		expect(getDefaultId({
			resourceFromProp: 'posts',
			idFromProp: undefined,
			resource: {
				resource: { name: 'posts' },
				action: 'show',
				id: 'resource-id',
			},
			inferredResource: {
				resource: { name: 'posts' },
				action: 'show',
				id: 'resource-id',
			},
		})).toBe('resource-id')
	})

	it('should ignore resource ids from non-show actions', () => {
		expect(getDefaultId({
			resourceFromProp: undefined,
			idFromProp: undefined,
			resource: {
				resource: { name: 'posts' },
				action: 'edit',
				id: 'resource-id',
			},
			inferredResource: {
				resource: { name: 'posts' },
				action: 'edit',
				id: 'resource-id',
			},
		})).toBeUndefined()
	})

	it('should return undefined when neither prop id nor show resource id is available', () => {
		expect(getDefaultId({
			resourceFromProp: undefined,
			idFromProp: undefined,
			resource: undefined,
			inferredResource: undefined,
		})).toBeUndefined()
	})
})
