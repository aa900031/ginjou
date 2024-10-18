import { expect, vi } from 'vitest'

const UNSUBSCRIBE_FN_KEY = 'subscribe key'

export const subscribeFn = vi.fn(() => UNSUBSCRIBE_FN_KEY)

export const publishFn = vi.fn()

export const unsubscribeFn = vi.fn()

export const MockRealtimes = {
	subscribe: subscribeFn,
	publish: publishFn,
	unsubscribe: unsubscribeFn,
}

export function expectUnsubscribeCalled(
	times: number = 1,
) {
	expect(unsubscribeFn).toBeCalledWith(UNSUBSCRIBE_FN_KEY)
	expect(unsubscribeFn).toBeCalledTimes(times)
}
