import type { SetRequired, ValueOf } from 'type-fest'

export const MutationMode = {
	Pessimistic: 'pessimistic',
	Optimistic: 'optimistic',
	Undoable: 'undoable',
} as const

export type MutationModeValues = ValueOf<typeof MutationMode>

export interface MutationModeProps {
	mutationMode?: MutationModeValues
	undoableTimeout?: number
}

export type ResolvedMutationModeProps = SetRequired<
	MutationModeProps,
	| 'mutationMode'
	| 'undoableTimeout'
>

export function resolveMutationModeProps(
	props: MutationModeProps,
): ResolvedMutationModeProps {
	return {
		mutationMode: props.mutationMode ?? MutationMode.Pessimistic,
		undoableTimeout: props.undoableTimeout ?? 5000,
	}
}
