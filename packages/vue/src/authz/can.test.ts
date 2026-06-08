import { describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref, unref } from 'vue-demi'
import { queryClient } from '../../test/mock-fetcher'
import { mountSetup } from '../../test/mount'
import { useCanAccess } from './can'

describe('useCanAccess', () => {
	it('should check access when computed queryOptions.enabled becomes true', async () => {
		const isEnabled = ref(false)
		const access = vi.fn(() => Promise.resolve({ can: true }))
		const queryOptions = computed(() => ({
			enabled: unref(isEnabled),
		}))

		const { result } = mountSetup(() => useCanAccess(
			{
				action: 'list',
				resource: 'posts',
				queryOptions,
			},
			{
				queryClient,
				authz: {
					access,
				},
			},
		))

		expect(unref(result.isFetched)).toBeFalsy()
		expect(access).not.toBeCalled()

		isEnabled.value = true
		await nextTick()

		await vi.waitFor(() => {
			expect(unref(result.isFetched)).toBeTruthy()
		})
		expect(access).toBeCalled()
	})
})
