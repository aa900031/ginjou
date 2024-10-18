import type { ArgTypes } from '@storybook/vue3'
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
} satisfies ArgTypes

export const args = {
	mutationMode: MutationMode.Pessimistic,
} as const
