import type { RouteLocationNormalized, RouteParams, RouteRecordNormalized } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { isChangingRoute, isLeavingRoute, isSameRouteRecord } from './route-record'

function createRecord(
	name: string,
	aliasOf?: RouteRecordNormalized,
): RouteRecordNormalized {
	return { name, aliasOf } as unknown as RouteRecordNormalized
}

function createLocation(
	matched: RouteRecordNormalized[],
	params: RouteParams = {},
): RouteLocationNormalized {
	return { matched, params } as unknown as RouteLocationNormalized
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

describe('isChangingRoute', () => {
	const edit = createRecord('post-edit')

	it('should not be changing on the first navigation of the session', () => {
		expect(isChangingRoute(
			createLocation([edit], { id: '1' }),
			createLocation([]),
		)).toBe(false)
	})

	it('should be changing when the record is left', () => {
		expect(isChangingRoute(
			createLocation([createRecord('posts')]),
			createLocation([edit], { id: '1' }),
		)).toBe(true)
	})

	it('should be changing when only the params change', () => {
		expect(isChangingRoute(
			createLocation([edit], { id: '2' }),
			createLocation([edit], { id: '1' }),
		)).toBe(true)
	})

	it('should not be changing when the record and the params both stay', () => {
		expect(isChangingRoute(
			createLocation([edit], { id: '1' }),
			createLocation([edit], { id: '1' }),
		)).toBe(false)
	})

	it('should be changing when the same record gains a param', () => {
		expect(isChangingRoute(
			createLocation([edit], { id: '1' }),
			createLocation([edit], {}),
		)).toBe(true)
	})

	it('should not be changing when entering a child route', () => {
		const posts = createRecord('posts')
		const detail = createRecord('post-detail')

		expect(isChangingRoute(
			createLocation([posts, detail], { id: '1' }),
			createLocation([posts], {}),
		)).toBe(false)
	})

	it('should not be changing for an alias with the same params', () => {
		const alias = createRecord('post-edit-alias', edit)

		expect(isChangingRoute(
			createLocation([alias], { id: '1' }),
			createLocation([edit], { id: '1' }),
		)).toBe(false)
	})

	it('should compare repeated params by value', () => {
		expect(isChangingRoute(
			createLocation([edit], { path: ['a', 'b'] }),
			createLocation([edit], { path: ['a', 'b'] }),
		)).toBe(false)

		expect(isChangingRoute(
			createLocation([edit], { path: ['a', 'b'] }),
			createLocation([edit], { path: ['a'] }),
		)).toBe(true)
	})
})
