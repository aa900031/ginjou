import { MutationMode } from '@ginjou/core'

export const argTypes = {
	mutationMode: {
		name: 'Mutation Mode',
		control: {
			type: 'radio',
		},
		options: [
			MutationMode.Optimistic,
			MutationMode.Pessimistic,
			MutationMode.Undoable,
		],
	},
}

export const args = {
	mutationMode: MutationMode.Pessimistic,
} as const
