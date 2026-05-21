import { describe, expect, it } from 'vitest'
import { extract } from './getter'

describe('extract', () => {
	it('should return plain values directly', () => {
		expect(extract(3)).toBe(3)
	})

	it('should resolve getter functions', () => {
		expect(extract(() => 4)).toBe(4)
	})

	it('should return the default for undefined getter results', () => {
		expect(extract<number>(() => undefined, 5)).toBe(5)
	})

	it('should return the default for undefined values', () => {
		expect(extract(undefined, 6)).toBe(6)
	})
})
