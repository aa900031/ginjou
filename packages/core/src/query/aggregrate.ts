export interface PromiseResolvePair<T> {
	resolve: (val: T | PromiseLike<T>) => void
	reject: (reason?: unknown) => void
}

export type ResolveArgsResult<TArgs, TResult> = [TArgs, PromiseResolvePair<TResult>[]][]

export function createAggregrateFn<
	TFn extends (...args: any[]) => Promise<any>,
	TArgs extends unknown[] = Parameters<TFn>,
	TResult = Awaited<ReturnType<TFn>>,
>(
	fn: TFn,
	resolveArgs: (
		allArgs: TArgs[],
		allResolves: PromiseResolvePair<TResult>[]
	) => ResolveArgsResult<TArgs, TResult>,
): TFn {
	let time: ReturnType<typeof setTimeout> | undefined

	const allArgs: TArgs[] = []
	const allResolves: PromiseResolvePair<TResult>[] = []

	function wrapFn(this: ThisType<TFn>, ...args: TArgs): Promise<TResult> {
		return new Promise<TResult>((resolve, reject) => {
			allArgs.push(args)
			allResolves.push({ resolve, reject })

			if (time)
				clearTimeout(time)

			time = setTimeout(async () => {
				time = undefined

				try {
					await exec()
				}
				finally {
					allArgs.length = 0
					allResolves.length = 0
				}
			}, 0)
		})
	}

	async function exec() {
		const aggregated = resolveArgs(allArgs, allResolves)

		for (const [args, resolves] of aggregated) {
			try {
				const r = await fn(...args)
				for (const { resolve } of resolves)
					resolve(r)
			}
			catch (e) {
				for (const { reject } of resolves)
					reject(e)
			}
		}
	}

	return wrapFn as unknown as TFn
}
