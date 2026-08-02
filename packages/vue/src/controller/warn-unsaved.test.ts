import type { Router, RouterBlockShouldFn, RouterLocation } from '@ginjou/core'
import { WarnUnsaved } from '@ginjou/core'
import { describe, expect, it, vi } from 'vitest'
import { nextTick, unref } from 'vue-demi'
import { mountSetup } from '../../test/mount'
import { useWarnUnsaved } from './warn-unsaved'

const LOCATION: RouterLocation = { path: '/posts/1/edit' }

function createMockRouter() {
	let shouldBlock: RouterBlockShouldFn | undefined
	let changeLocation: ((value: RouterLocation) => void) | undefined

	const handle = {
		unregister: vi.fn(),
		proceed: vi.fn(),
		reset: vi.fn(),
	}

	const router: Router = {
		go: vi.fn(),
		back: vi.fn(),
		resolve: vi.fn(),
		getLocation: () => LOCATION,
		onChangeLocation: (handler) => {
			changeLocation = handler
			return vi.fn()
		},
		blocker: (fn) => {
			shouldBlock = fn
			return handle
		},
	}

	return {
		router,
		handle,
		isRegistered: () => shouldBlock != null,
		emitChangeLocation: () => changeLocation?.({ path: '/posts' }),
		callShouldBlock: () => shouldBlock!({
			currentLocation: LOCATION,
			nextLocation: { path: '/posts' },
		}),
	}
}

describe('useWarnUnsaved', () => {
	it('should proceed when confirmed', async () => {
		const { router, handle, callShouldBlock } = createMockRouter()
		const confirm = vi.fn(() => Promise.resolve(true))

		const { result } = mountSetup(() => useWarnUnsaved({ enabled: true, confirm }, { router }))

		result.active.value = true
		expect(unref(result.state)).toBe(WarnUnsaved.State.Active)

		expect(callShouldBlock()).toBe(true)
		await nextTick()

		await vi.waitFor(() => {
			expect(handle.proceed).toHaveBeenCalled()
		})
		expect(confirm).toHaveBeenCalledTimes(1)
		expect(handle.reset).not.toHaveBeenCalled()
	})

	it('should reset when not confirmed', async () => {
		const { router, handle, callShouldBlock } = createMockRouter()
		const confirm = vi.fn(() => Promise.resolve(false))

		const { result } = mountSetup(() => useWarnUnsaved({ enabled: true, confirm }, { router }))

		result.active.value = true
		expect(callShouldBlock()).toBe(true)
		await nextTick()

		await vi.waitFor(() => {
			expect(handle.reset).toHaveBeenCalled()
		})
		expect(handle.proceed).not.toHaveBeenCalled()
	})

	it('should not block when disabled', () => {
		const { router, isRegistered } = createMockRouter()
		const confirm = vi.fn(() => true)

		const { result } = mountSetup(() => useWarnUnsaved({ enabled: false, confirm }, { router }))

		result.active.value = true

		expect(unref(result.state)).toBe(WarnUnsaved.State.Inactive)
		expect(isRegistered()).toBe(false)
		expect(confirm).not.toHaveBeenCalled()
	})

	it('should be confirming while the confirm fn is pending', async () => {
		const { router, callShouldBlock } = createMockRouter()
		let resolveConfirm: (value: boolean) => void
		const confirm = vi.fn(() => new Promise<boolean>((resolve) => {
			resolveConfirm = resolve
		}))

		const { result } = mountSetup(() => useWarnUnsaved({ enabled: true, confirm }, { router }))

		result.active.value = true
		expect(callShouldBlock()).toBe(true)
		await nextTick()

		await vi.waitFor(() => {
			expect(unref(result.state)).toBe(WarnUnsaved.State.Confirming)
		})

		resolveConfirm!(true)
		await vi.waitFor(() => {
			expect(unref(result.state)).toBe(WarnUnsaved.State.Active)
		})
		expect(result.active.value).toBe(true)
	})
})
