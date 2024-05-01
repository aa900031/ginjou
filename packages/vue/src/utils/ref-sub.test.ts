import { describe, expect, it } from 'vitest'
import { reactive, ref, shallowReactive, unref, watchEffect } from 'vue'
import { refSub } from './ref-sub'

describe('ref-sub', () => {
	it('should correct get value', () => {
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
		const result = refSub(props, ({ prop }) => prop.a.b)
		expect(unref(result)).toEqual({ c: { d: true } })
	})
})
