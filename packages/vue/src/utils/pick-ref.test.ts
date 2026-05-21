import { describe, expect, it } from 'vitest'
import { ref, unref } from 'vue-demi'
import { pickRef } from './pick-ref'

describe('pickRef', () => {
	it('should get sub value', () => {
		const props = ref({
			a: {
				b: {
					c: {
						d: true,
					},
				},
			},
			aa: {
				bb: {
					cc: {
						dd: false,
					},
				},
			},
		})
		const result = pickRef(props, ({ prop }) => prop.a.b)
		expect(unref(result)).toEqual({ c: { d: true } })
	})

	it('should update when the source ref changes', () => {
		const props = ref({
			current: 1,
		})
		const result = pickRef(props, ({ prop }) => prop.current)

		expect(unref(result)).toBe(1)

		props.value = {
			current: 2,
		}

		expect(unref(result)).toBe(2)
	})

	it('should pass previous value to the getter', () => {
		const props = ref({
			current: 1,
		})
		const result = pickRef(props, ({ prop, prev }) => {
			return (prev ?? 0) + prop.current
		})

		expect(unref(result)).toBe(1)

		props.value = {
			current: 2,
		}

		expect(unref(result)).toBe(3)
	})
})
