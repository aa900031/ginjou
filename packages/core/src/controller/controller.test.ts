import type { Controller } from './controller'
import { describe, expect, it } from 'vitest'
import { defineController } from './controller'

describe('defineController', () => {
	it('should return the provided controller', () => {
		const controller: Controller = {
			resources: [],
		}
		expect(defineController(controller)).toBe(controller)
	})
})
