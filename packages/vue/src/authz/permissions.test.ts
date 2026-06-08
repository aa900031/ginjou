import { describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref, unref } from 'vue-demi'
import { queryClient } from '../../test/mock-fetcher'
import { mountSetup } from '../../test/mount'
import { usePermissions } from './permissions'

describe('usePermissions', () => {
	it('should get permissions when computed queryOptions.enabled becomes true', async () => {
		const isEnabled = ref(false)
		const getPermissions = vi.fn(() => Promise.resolve(['posts:list']))
		const queryOptions = computed(() => ({
			enabled: unref(isEnabled),
		}))

		const { result } = mountSetup(() => usePermissions(
			{ queryOptions },
			{
				queryClient,
				authz: {
					getPermissions,
				},
			},
		))

		expect(unref(result.isFetched)).toBeFalsy()
		expect(getPermissions).not.toBeCalled()

		isEnabled.value = true
		await nextTick()

		await vi.waitFor(() => {
			expect(unref(result.isFetched)).toBeTruthy()
		})
		expect(getPermissions).toBeCalled()
	})
})
