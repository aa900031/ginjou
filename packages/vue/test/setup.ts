import { beforeEach } from 'vitest'
import { queryClient } from './mock-fetcher'
import { publishFn, subscribeFn, unsubscribeFn } from './mock-realtime'

beforeEach(() => {
	queryClient.clear()
})

beforeEach(() => {
	subscribeFn.mockClear()
	unsubscribeFn.mockClear()
	publishFn.mockClear()
})
