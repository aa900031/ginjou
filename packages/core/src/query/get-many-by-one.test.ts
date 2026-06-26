import type { QueryObserverResult } from '@tanstack/query-core'
import type { BaseRecord, GetOneResult } from './fetcher'
import { describe, expect, it, vi } from 'vitest'
import { createCombineFn } from './get-many-by-one'

interface Post extends BaseRecord {
	id: string
	title: string
}

function createResult(
	overrides: Partial<QueryObserverResult<GetOneResult<Post>, Error>>,
): QueryObserverResult<GetOneResult<Post>, Error> {
	return {
		data: undefined,
		dataUpdatedAt: 0,
		error: null,
		errorUpdatedAt: 0,
		failureCount: 0,
		failureReason: null,
		errorUpdateCount: 0,
		isError: false,
		isFetched: true,
		isFetchedAfterMount: true,
		isFetching: false,
		isLoading: false,
		isPending: false,
		isLoadingError: false,
		isInitialLoading: false,
		isPaused: false,
		isPlaceholderData: false,
		isRefetchError: false,
		isRefetching: false,
		isStale: false,
		isSuccess: false,
		isEnabled: true,
		refetch: async () => createResult(overrides),
		status: 'pending',
		fetchStatus: 'idle',
		promise: Promise.resolve({ data: { id: '0', title: 'placeholder' } }),
		...overrides,
	} as QueryObserverResult<GetOneResult<Post>, Error>
}

describe('createCombineFn', () => {
	const combine = createCombineFn<Post, Error>()

	it('should return full data only when every child query succeeds', () => {
		const result = combine([
			createResult({
				data: { data: { id: '1', title: 'A' } },
				dataUpdatedAt: 10,
				isSuccess: true,
				status: 'success',
			}),
			createResult({
				data: { data: { id: '2', title: 'B' } },
				dataUpdatedAt: 20,
				isSuccess: true,
				status: 'success',
			}),
		])

		expect(result.status).toBe('success')
		expect(result.data).toEqual({
			data: [
				{ id: '1', title: 'A' },
				{ id: '2', title: 'B' },
			],
		})
		expect(result.error).toBeNull()
		expect(result.dataUpdatedAt).toBe(10)
	})

	it('should keep data undefined while any child query is still pending', () => {
		const result = combine([
			createResult({
				data: { data: { id: '1', title: 'A' } },
				isSuccess: true,
				status: 'success',
			}),
			createResult({
				isPending: true,
				isLoading: true,
				isFetching: true,
				fetchStatus: 'fetching',
				status: 'pending',
			}),
		])

		expect(result.status).toBe('pending')
		expect(result.data).toBeUndefined()
		expect(result.error).toBeNull()
		expect(result.isLoading).toBe(true)
	})

	it('should not report loading when pending child queries are disabled', () => {
		const result = combine([
			createResult({
				data: { data: { id: '1', title: 'A' } },
				isSuccess: true,
				status: 'success',
			}),
			createResult({
				isEnabled: false,
				isPending: true,
				isLoading: false,
				status: 'pending',
			}),
		])

		expect(result.status).toBe('pending')
		expect(result.isPending).toBe(true)
		expect(result.isLoading).toBe(false)
	})

	it('should keep data undefined when any child query has an error', () => {
		const error = new Error('boom')
		const result = combine([
			createResult({
				data: { data: { id: '1', title: 'A' } },
				isSuccess: true,
				status: 'success',
			}),
			createResult({
				error,
				isError: true,
				isLoadingError: true,
				status: 'error',
			}),
		])

		expect(result.status).toBe('error')
		expect(result.data).toBeUndefined()
		expect(result.error).toBe(error)
		expect(result.isError).toBe(true)
	})

	it('should aggregate child query metadata without rescanning semantics changing', () => {
		const result = combine([
			createResult({
				data: { data: { id: '1', title: 'A' } },
				dataUpdatedAt: 20,
				errorUpdatedAt: 3,
				errorUpdateCount: 2,
				failureCount: 1,
				isPlaceholderData: true,
				isFetching: true,
				isRefetching: true,
				isStale: true,
				isSuccess: true,
				status: 'success',
			}),
			createResult({
				data: { data: { id: '2', title: 'B' } },
				dataUpdatedAt: 10,
				errorUpdatedAt: 7,
				errorUpdateCount: 4,
				failureCount: 5,
				isFetched: false,
				isFetchedAfterMount: false,
				isEnabled: false,
				isSuccess: true,
				status: 'success',
			}),
		])

		expect(result.isPlaceholderData).toBe(true)
		expect(result.isFetching).toBe(true)
		expect(result.fetchStatus).toBe('fetching')
		expect(result.isRefetching).toBe(true)
		expect(result.errorUpdatedAt).toBe(7)
		expect(result.errorUpdateCount).toBe(6)
		expect(result.failureCount).toBe(5)
		expect(result.isFetched).toBe(false)
		expect(result.isFetchedAfterMount).toBe(false)
		expect(result.isStale).toBe(true)
		expect(result.isEnabled).toBe(true)
	})

	it('should report refetch errors without marking them as loading errors', () => {
		const error = new Error('boom')
		const result = combine([
			createResult({
				data: { data: { id: '1', title: 'A' } },
				isSuccess: true,
				status: 'success',
			}),
			createResult({
				error,
				isError: true,
				isRefetchError: true,
				status: 'error',
			}),
		])

		expect(result.isError).toBe(true)
		expect(result.isLoadingError).toBe(false)
		expect(result.isRefetchError).toBe(true)
	})

	it('should refetch each child query and recombine the updated result', async () => {
		const firstRefetch = vi.fn(async () => createResult({
			data: { data: { id: '3', title: 'C' } },
			isSuccess: true,
			status: 'success',
		}))
		const secondRefetch = vi.fn(async () => createResult({
			data: { data: { id: '4', title: 'D' } },
			isSuccess: true,
			status: 'success',
		}))
		const result = combine([
			createResult({
				data: { data: { id: '1', title: 'A' } },
				isSuccess: true,
				status: 'success',
				refetch: firstRefetch,
			}),
			createResult({
				data: { data: { id: '2', title: 'B' } },
				isSuccess: true,
				status: 'success',
				refetch: secondRefetch,
			}),
		])

		const refetched = await result.refetch()

		expect(firstRefetch).toHaveBeenCalledOnce()
		expect(secondRefetch).toHaveBeenCalledOnce()
		expect(refetched.data).toEqual({
			data: [
				{ id: '3', title: 'C' },
				{ id: '4', title: 'D' },
			],
		})
		expect(refetched.status).toBe('success')
	})

	it('should lazily read child promises only when combined promise is accessed', async () => {
		let promiseReads = 0
		const first = createResult({
			data: { data: { id: '1', title: 'A' } },
			isSuccess: true,
			status: 'success',
		})
		const second = createResult({
			data: { data: { id: '2', title: 'B' } },
			isSuccess: true,
			status: 'success',
		})

		Object.defineProperty(first, 'promise', {
			get() {
				promiseReads += 1
				return Promise.resolve({ data: { id: '1', title: 'A' } })
			},
		})
		Object.defineProperty(second, 'promise', {
			get() {
				promiseReads += 1
				return Promise.resolve({ data: { id: '2', title: 'B' } })
			},
		})

		const result = combine([
			first,
			second,
		])

		expect(promiseReads).toBe(0)

		await result.promise

		expect(promiseReads).toBe(2)
	})
})
