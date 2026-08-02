import type { ValueOf } from 'type-fest'
import type { RouterBlockerFn, RouterBlockerHandle, RouterBlockShouldFn, RouterBlockShouldInput } from './router'

export const State = {
	Unblocked: 'unblocked',
	Blocked: 'blocked',
	Proceeding: 'proceeding',
} as const

export type StateValues = ValueOf<typeof State>

export interface Props {
	enabled?: boolean
	shouldBlock: boolean | RouterBlockShouldFn
}

export const defaultEnabled = true

export interface ShouldRegisterProps {
	enabled: Props['enabled']
	state: StateValues
}

export function shouldRegister(
	props: ShouldRegisterProps,
): boolean {
	return (
		props.enabled ?? defaultEnabled
	)
	|| props.state !== State.Unblocked
}

export interface CreateShouldBlockFnProps {
	getShouldBlock: () => Props['shouldBlock']
	setState: (value: StateValues) => void
}

export function createShouldBlockFn(
	props: CreateShouldBlockFnProps,
): RouterBlockShouldFn {
	const { getShouldBlock, setState } = props

	return function shouldBlock(context) {
		const resolved = getShouldBlock()
		const value = typeof resolved === 'function'
			? resolved(context)
			: resolved

		if (context.nextLocation == null)
			return value

		if (!value)
			return false

		setState(State.Blocked)
		return true
	}
}

export interface HandleChangeLocationProps {
	state: StateValues
	setState: (value: StateValues) => void
}

export function handleChangeLocation(
	props: HandleChangeLocationProps,
): void {
	const { state, setState } = props

	if (state === State.Proceeding)
		setState(State.Unblocked)
}

export interface ProceedProps {
	setState: (value: StateValues) => void
	handle: RouterBlockerHandle
}

export interface ResetProps {
	setState: (value: StateValues) => void
	handle: RouterBlockerHandle
}

export function proceed(
	props: ProceedProps,
): void {
	props.setState(State.Proceeding)
	props.handle.proceed()
}

export function reset(
	props: ResetProps,
): void {
	props.setState(State.Unblocked)
	props.handle.reset()
}

export interface CreateRegistrarProps {
	blocker: RouterBlockerFn
	getShouldBlock: () => Props['shouldBlock']
	setState: (value: StateValues) => void
}

export interface Registrar {
	/** Brings the registration in line with `shouldRegister`. Safe to call with an unchanged value. */
	sync: (needed: boolean) => void
	proceed: () => void
	reset: () => void
	dispose: () => void
}

/**
 * Owns the router handle and everything that needs one.
 *
 * The handle is the one piece of mutable state in a blocker, and the rules around it are the same
 * whichever framework is driving: register at most once, never register twice, and answer nothing
 * while there is nothing registered. Keeping it here is what lets an adapter be only the reactive
 * glue — when the check runs, how a prop is read, how it is torn down — instead of a second copy of
 * these rules.
 *
 * `sync` is idempotent because it has to be: one adapter's watch compares its source and calls back
 * only on a change, the other re-runs its callback on any dependency change at all. Re-registering
 * on a no-op call would settle a navigation the user is still being asked about.
 */
export function createRegistrar(
	props: CreateRegistrarProps,
): Registrar {
	const { blocker, getShouldBlock, setState } = props

	let handle: RouterBlockerHandle | undefined

	return {
		sync: (needed) => {
			if (needed === (handle != null))
				return

			if (!needed) {
				handle!.unregister()
				handle = undefined
				return
			}

			handle = blocker(createShouldBlockFn({ getShouldBlock, setState }))
		},
		proceed: () => {
			if (handle != null)
				proceed({ setState, handle })
		},
		reset: () => {
			if (handle != null)
				reset({ setState, handle })
		},
		dispose: () => {
			handle?.unregister()
			handle = undefined
		},
	}
}

export interface Entry {
	shouldBlock: RouterBlockShouldFn
	resolve?: (value: boolean) => void
}

export async function checkEntries(
	entries: Iterable<Entry>,
	input: RouterBlockShouldInput,
): Promise<boolean> {
	// Iterated live, not through a snapshot. There is an `await` in here, so the set can change
	// while the user decides: an entry whose owner went away before its turn must not be asked,
	// nothing would be left to settle the hold it would take, and one that appeared in the meantime
	// has unsaved state of its own to speak for.
	for (const entry of entries) {
		if (!entry.shouldBlock(input))
			continue

		let settle: ((value: boolean) => void) | undefined
		const proceeded = await new Promise<boolean>((resolve) => {
			settle = resolve
			entry.resolve?.(false)
			entry.resolve = resolve
		})

		if (entry.resolve === settle)
			entry.resolve = undefined

		if (!proceeded)
			return false
	}

	return true
}
