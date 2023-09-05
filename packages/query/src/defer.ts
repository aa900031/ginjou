export interface DeferProps {
	exec: () => Promise<void>
	cancel: (error?: unknown) => void
}

export type DeferFn = (props: DeferProps) => void | Promise<void>

export function deferWith<
	TDeferFn extends DeferFn,
	TActionFn extends () => Promise<any>,
	TResult = Awaited<ReturnType<TActionFn>>,
>(
	deferFn: TDeferFn,
	actionFn: TActionFn,
	onDefered?: () => void | Promise<void>,
): Promise<TResult> {
	return new Promise<TResult>((resolve, reject) => {
		const deferProps: DeferProps = {
			exec: async () => {
				try {
					const result = await actionFn()
					resolve(result)
				}
				catch (error) {
					reject(error)
				}
			},
			cancel: () => reject(new DeferCancelledError()),
		}

		const defered = deferFn(deferProps)
		if (defered && 'then' in defered)
			defered.then(() => onDefered?.())
		else
			onDefered?.()
	})
}

export class DeferCancelledError extends Error { }
