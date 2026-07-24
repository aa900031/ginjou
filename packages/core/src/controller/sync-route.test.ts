import { describe, expect, it } from 'vitest'
import { resolve } from './sync-route'

describe('resolve', () => {
	it('should prefer the local value', () => {
		expect(resolve({ syncRoute: true }, false)).toBe(false)
	})

	it('should fall back to the controller value', () => {
		const syncRoute = {
			filters: { field: 'f' },
		}

		expect(resolve({ syncRoute }, undefined)).toBe(syncRoute)
	})

	it('should use the default value', () => {
		expect(resolve(undefined, undefined)).toBe(false)
	})
})
