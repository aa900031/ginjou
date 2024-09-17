import { describe, expect, it, vi } from 'vitest'
import { AbortDefer, defer } from './defer'

describe('defer', () => {
	it('should awaited run() called', async () => {
		const exec = vi.fn(() => Promise.resolve('y'))
		const { run } = defer(exec)

		const result = await run()
		expect(result).toBe('y')
	})

	it('should awaited promise', async () => {
		const exec = vi.fn(() => Promise.resolve('y'))
		const { promise, run } = defer(exec)
		run()

		const result = await promise
		expect(result).toBe('y')
	})

	it('should throw when exec has expection', async () => {
		class E extends Error {
			name = 'e'
		}
		const exec = vi.fn(() => Promise.reject(new E()))
		const { promise, run } = defer(exec)

		setTimeout(async () => {
			await expect(run()).rejects.toBeInstanceOf(E)
		}, 0)

		await expect(promise).rejects.toBeInstanceOf(E)
	})

	it('should can cancel and reject with AbortDefer error', async () => {
		const exec = vi.fn(() => Promise.resolve('y'))
		const { promise, cancel } = defer(exec)

		setTimeout(() => {
			cancel()
		}, 0)

		await expect(promise).rejects.toBeInstanceOf(AbortDefer)
	})
})
