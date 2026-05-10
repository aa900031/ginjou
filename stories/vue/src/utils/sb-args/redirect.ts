import type { ArgTypes } from '@storybook/vue3'
import { ResourceAction } from '@ginjou/core'

export const argTypes = {
	redirect: {
		name: 'Redirect',
		control: {
			type: 'radio',
			labels: {
				[`${ResourceAction.Type.List}`]: 'List',
				[`${ResourceAction.Type.Create}`]: 'Create',
				[`${ResourceAction.Type.Show}`]: 'Show',
				[`${ResourceAction.Type.Edit}`]: 'Edit',
				false: 'False',
			},
		},
		options: [
			ResourceAction.Type.List,
			ResourceAction.Type.Create,
			ResourceAction.Type.Show,
			ResourceAction.Type.Edit,
			false,
		],
	},
} satisfies ArgTypes
