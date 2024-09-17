import { ResourceActionType } from '@ginjou/core'
import type { ArgTypes } from '@storybook/vue3'

export const argTypes = {
	redirect: {
		name: 'Redirect',
		control: {
			type: 'radio',
			labels: {
				[`${ResourceActionType.List}`]: 'List',
				[`${ResourceActionType.Create}`]: 'Create',
				[`${ResourceActionType.Show}`]: 'Show',
				[`${ResourceActionType.Edit}`]: 'Edit',
				false: 'False',
			},
		},
		options: [
			ResourceActionType.List,
			ResourceActionType.Create,
			ResourceActionType.Show,
			ResourceActionType.Edit,
			false,
		],
	},
} satisfies ArgTypes
