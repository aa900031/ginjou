import { describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref, unref } from 'vue-demi'
import { MockFetchers, queryClient } from '../../test/mock-fetcher'
import { mountTestApp } from '../../test/mount'
import { useCustom } from './custom'

describe('useCustom', () => {
	it('should fetch when computed queryOptions.enabled becomes true', async () => {
		const isEnabled = ref(false)
		const queryOptions = computed(() => ({
			enabled: unref(isEnabled),
		}))

		const { result } = mountTestApp(
			() => useCustom({
				url: '/posts/1',
				method: 'get',
				queryOptions,
			}),
			{
				queryClient,
				fetchers: MockFetchers,
			},
		)

		expect(unref(result.isFetched)).toBeFalsy()

		isEnabled.value = true
		await nextTick()

		await vi.waitFor(() => {
			expect(unref(result.isFetched)).toBeTruthy()
		})
	})
})
