import type { Promisable } from 'type-fest'

export class AbortDefer extends Error {
	name = 'AbortDefer'
}

export interface DeferResult<TResult> {
	run: () => Promise<TResult>
	cancel: () => void
	promise: Promise<TResult>
}

export function defer<
	TResult,
>(
	exec: () => Promisable<TResult>,
): DeferResult<TResult> {
	let resolve: Parameters<ConstructorParameters<typeof Promise<TResult>>[0]>[0]
	let reject: Parameters<ConstructorParameters<typeof Promise<TResult>>[0]>[1]
	const promise = new Promise<TResult>((res, rej) => {
		resolve = res
		reject = rej
	})

	async function run() {
		try {
			const result = await exec()
			resolve(result)
			return result
		}
		catch (err) {
			reject(err)
			throw err
		}
	}

	function cancel() {
		reject(new AbortDefer())
	}

	return {
		run,
		cancel,
		promise,
	}
}
