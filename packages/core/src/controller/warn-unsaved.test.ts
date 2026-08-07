import type { HandleBlockedProps } from './warn-unsaved'
import { describe, expect, it, vi } from 'vitest'
import { getConfirm, getEnabled, getPropsConfirmFromProp, getPropsEnabledFromProp, getState, handleBlocked, State } from './warn-unsaved'

const defaultConfirm = (): boolean => true

describe('getPropsEnabledFromProp', () => {
	it('should take booleans as the enabled flag', () => {
		expect(getPropsEnabledFromProp(true)).toBe(true)
		expect(getPropsEnabledFromProp(false)).toBe(false)
	})

	it('should read the enabled field of the object form', () => {
		expect(getPropsEnabledFromProp({ enabled: true })).toBe(true)
		expect(getPropsEnabledFromProp({ enabled: false })).toBe(false)
	})

	it('should return undefined when unset', () => {
		expect(getPropsEnabledFromProp(undefined)).toBeUndefined()
	})

	it('should take the object form as opting in', () => {
		expect(getPropsEnabledFromProp({})).toBe(true)
		expect(getPropsEnabledFromProp({ confirm: () => true })).toBe(true)
	})
})

describe('getPropsConfirmFromProp', () => {
	it('should read the confirm field of the object form', () => {
		const confirm = (): boolean => true

		expect(getPropsConfirmFromProp({ confirm })).toBe(confirm)
	})

	it('should return undefined when unset', () => {
		expect(getPropsConfirmFromProp(undefined)).toBeUndefined()
		expect(getPropsConfirmFromProp({})).toBeUndefined()
		expect(getPropsConfirmFromProp({ enabled: true })).toBeUndefined()
	})

	it('should return undefined for the boolean form', () => {
		expect(getPropsConfirmFromProp(true)).toBeUndefined()
		expect(getPropsConfirmFromProp(false)).toBeUndefined()
	})
})

describe('getEnabled', () => {
	it('should respect prop over controller', () => {
		expect(getEnabled({ fromProp: true, fromController: false })).toBe(true)
		expect(getEnabled({ fromProp: false, fromController: true })).toBe(false)
	})

	it('should fallback to controller', () => {
		expect(getEnabled({ fromProp: undefined, fromController: true })).toBe(true)
		expect(getEnabled({ fromProp: undefined, fromController: false })).toBe(false)
		expect(getEnabled({ fromProp: undefined, fromController: { enabled: true } })).toBe(true)
		expect(getEnabled({ fromProp: undefined, fromController: { enabled: false } })).toBe(false)
		expect(getEnabled({ fromProp: undefined, fromController: { confirm: () => true } })).toBe(true)
	})

	it('should fallback to false', () => {
		expect(getEnabled({ fromProp: undefined, fromController: undefined })).toBe(false)
	})
})

describe('getConfirm', () => {
	it('should respect prop over controller', () => {
		const fromProp = () => true
		const confirm = () => false

		expect(getConfirm({ fromProp, fromController: { confirm }, defaultConfirm })).toBe(fromProp)
	})

	it('should fallback to controller', () => {
		const confirm = () => false

		expect(getConfirm({ fromProp: undefined, fromController: { confirm }, defaultConfirm })).toBe(confirm)
	})

	it('should fall back to the adapter default', () => {
		expect(getConfirm({ fromProp: undefined, fromController: true, defaultConfirm })).toBe(defaultConfirm)
	})
})

describe('getState', () => {
	it('should be confirming whatever enabled and active are', () => {
		expect(getState({ enabled: true, active: true, confirming: true })).toBe(State.Confirming)
		expect(getState({ enabled: false, active: false, confirming: true })).toBe(State.Confirming)
		expect(getState({ enabled: true, active: false, confirming: true })).toBe(State.Confirming)
		expect(getState({ enabled: false, active: true, confirming: true })).toBe(State.Confirming)
	})

	it('should be active when enabled and active', () => {
		expect(getState({ enabled: true, active: true, confirming: false })).toBe(State.Active)
	})

	it('should be inactive otherwise', () => {
		expect(getState({ enabled: true, active: false, confirming: false })).toBe(State.Inactive)
		expect(getState({ enabled: false, active: true, confirming: false })).toBe(State.Inactive)
		expect(getState({ enabled: false, active: false, confirming: false })).toBe(State.Inactive)
	})
})

describe('handleBlocked', () => {
	function createProps(
		value: Partial<Pick<HandleBlockedProps, 'blocked' | 'confirming' | 'confirm'>>,
	) {
		return {
			blocked: true,
			confirming: false,
			confirm: vi.fn(() => true) as HandleBlockedProps['confirm'],
			setConfirming: vi.fn(),
			proceed: vi.fn(),
			reset: vi.fn(),
			...value,
		}
	}

	it('should do nothing when not blocked', async () => {
		const props = createProps({ blocked: false })

		await handleBlocked(props)

		expect(props.confirm).not.toHaveBeenCalled()
		expect(props.setConfirming).not.toHaveBeenCalled()
		expect(props.proceed).not.toHaveBeenCalled()
		expect(props.reset).not.toHaveBeenCalled()
	})

	it('should do nothing when already confirming', async () => {
		const props = createProps({ confirming: true })

		await handleBlocked(props)

		expect(props.confirm).not.toHaveBeenCalled()
		expect(props.setConfirming).not.toHaveBeenCalled()
		expect(props.proceed).not.toHaveBeenCalled()
		expect(props.reset).not.toHaveBeenCalled()
	})

	it('should proceed when confirmed', async () => {
		const props = createProps({ confirm: vi.fn(() => true) })

		await handleBlocked(props)

		expect(props.setConfirming.mock.calls).toEqual([[true], [false]])
		expect(props.proceed).toHaveBeenCalledOnce()
		expect(props.reset).not.toHaveBeenCalled()
	})

	it('should reset when not confirmed', async () => {
		const props = createProps({ confirm: vi.fn(() => false) })

		await handleBlocked(props)

		expect(props.setConfirming.mock.calls).toEqual([[true], [false]])
		expect(props.reset).toHaveBeenCalledOnce()
		expect(props.proceed).not.toHaveBeenCalled()
	})

	it('should reset when confirm rejects', async () => {
		const props = createProps({ confirm: vi.fn(() => Promise.reject(new Error('nope'))) })

		await handleBlocked(props)

		expect(props.setConfirming.mock.calls).toEqual([[true], [false]])
		expect(props.reset).toHaveBeenCalledOnce()
		expect(props.proceed).not.toHaveBeenCalled()
	})

	it('should await an async confirm', async () => {
		let resolveConfirm: (value: boolean) => void
		const props = createProps({
			confirm: vi.fn(() => new Promise<boolean>((resolve) => {
				resolveConfirm = resolve
			})),
		})

		const promise = handleBlocked(props)

		expect(props.setConfirming.mock.calls).toEqual([[true]])
		expect(props.proceed).not.toHaveBeenCalled()

		resolveConfirm!(true)
		await promise

		expect(props.setConfirming.mock.calls).toEqual([[true], [false]])
		expect(props.proceed).toHaveBeenCalledOnce()
	})
})
