import { describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref, unref } from 'vue-demi'
import { queryClient } from '../../test/mock-fetcher'
import { mountSetup } from '../../test/mount'
import { useGetIdentity } from './identity'

describe('useGetIdentity', () => {
	it('should get identity when computed queryOptions.enabled becomes true', async () => {
		const isEnabled = ref(false)
		const getIdentity = vi.fn(() => Promise.resolve({ id: '1' }))
		const queryOptions = computed(() => ({
			enabled: unref(isEnabled),
		}))

		const { result } = mountSetup(() => useGetIdentity(
			{ queryOptions },
			{
				queryClient,
				auth: {
					login: vi.fn(),
					logout: vi.fn(),
					check: vi.fn(),
					checkError: vi.fn(),
					getIdentity,
				},
			},
		))

		expect(unref(result.isFetched)).toBeFalsy()
		expect(getIdentity).not.toBeCalled()

		isEnabled.value = true
		await nextTick()

		await vi.waitFor(() => {
			expect(unref(result.isFetched)).toBeTruthy()
		})
		expect(getIdentity).toBeCalled()
	})
})
