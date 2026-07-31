import type { RouteLocationNormalized, RouteRecordNormalized } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { isLeavingRoute, isSameRouteRecord } from './route-record'

function createRecord(
	name: string,
	aliasOf?: RouteRecordNormalized,
): RouteRecordNormalized {
	return { name, aliasOf } as unknown as RouteRecordNormalized
}

function createLocation(
	matched: RouteRecordNormalized[],
): RouteLocationNormalized {
	return { matched } as unknown as RouteLocationNormalized
}

describe('isSameRouteRecord', () => {
	it('should be same for the identical record', () => {
		const record = createRecord('posts')

		expect(isSameRouteRecord(record, record)).toBe(true)
	})

	it('should be same for an alias and the record it aliases', () => {
		const record = createRecord('posts')
		const alias = createRecord('posts-alias', record)

		expect(isSameRouteRecord(alias, record)).toBe(true)
		expect(isSameRouteRecord(record, alias)).toBe(true)
	})

	it('should not be same for unrelated records', () => {
		expect(isSameRouteRecord(createRecord('posts'), createRecord('users'))).toBe(false)
	})
})

describe('isLeavingRoute', () => {
	it('should not be leaving when from has no matched records', () => {
		const posts = createRecord('posts')

		expect(isLeavingRoute(createLocation([posts]), createLocation([]))).toBe(false)
	})

	it('should not be leaving when the leaf is still matched', () => {
		const root = createRecord('root')
		const posts = createRecord('posts')

		expect(isLeavingRoute(
			createLocation([root, posts]),
			createLocation([root, posts]),
		)).toBe(false)
	})

	it('should be leaving when the leaf is no longer matched', () => {
		const root = createRecord('root')
		const posts = createRecord('posts')
		const users = createRecord('users')

		expect(isLeavingRoute(
			createLocation([root, users]),
			createLocation([root, posts]),
		)).toBe(true)
	})

	it('should not be leaving when to matches the alias of the leaving record', () => {
		const posts = createRecord('posts')
		const alias = createRecord('posts-alias', posts)

		expect(isLeavingRoute(
			createLocation([alias]),
			createLocation([posts]),
		)).toBe(false)
	})
})
