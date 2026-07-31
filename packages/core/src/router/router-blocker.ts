import type { ValueOf } from 'type-fest'
import type { RouterBlockerHandle, RouterBlockShouldFn } from './router'
import { RouterBlockerAction } from './router'

export const State = {
	Unblocked: 'unblocked',
	Blocked: 'blocked',
	Proceeding: 'proceeding',
} as const

export type StateValues = ValueOf<typeof State>

export interface Props {
	shouldBlock: boolean | RouterBlockShouldFn
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

		if (context.action === RouterBlockerAction.Unload)
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
