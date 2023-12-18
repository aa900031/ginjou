import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import type { ListParams } from '.'
import { createListParams } from '.'

describe('test List Params', () => {
	it('should default value', () => {
		const params = createListParams()
		expect(params.getValue()).toMatchSnapshot()
	})

	it('should emit "change" after update value', () => {
		const params = createListParams()
		const handler = vi.fn().mockImplementation((event: { value: ListParams }) => {
			expect(event.value.pagination.current).toBe(2)
			expectTypeOf(event.value).toEqualTypeOf<ListParams>()
		})
		params.on('change', handler)
		params.setPage(2)

		expect(handler).toBeCalledTimes(1)
	})
})
