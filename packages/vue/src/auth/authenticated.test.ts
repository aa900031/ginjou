import { describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref, unref } from 'vue-demi'
import { queryClient } from '../../test/mock-fetcher'
import { mountSetup } from '../../test/mount'
import { useAuthenticated } from './authenticated'

describe('useAuthenticated', () => {
	it('should check auth when computed queryOptions.enabled becomes true', async () => {
		const isEnabled = ref(false)
		const check = vi.fn(() => Promise.resolve({ authenticated: true }))
		const queryOptions = computed(() => ({
			enabled: unref(isEnabled),
		}))

		const { result } = mountSetup(() => useAuthenticated(
			{ queryOptions },
			{
				queryClient,
				auth: {
					login: vi.fn(),
					logout: vi.fn(),
					check,
					checkError: vi.fn(),
				},
			},
		))

		expect(unref(result.isFetched)).toBeFalsy()
		expect(check).not.toBeCalled()

		isEnabled.value = true
		await nextTick()

		await vi.waitFor(() => {
			expect(unref(result.isFetched)).toBeTruthy()
		})
		expect(check).toBeCalled()
	})
})
