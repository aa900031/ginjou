import type { Meta, StoryObj } from '@storybook/svelte-vite'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import WarnUnsavedEdit from './WarnUnsavedEdit.svelte'

const meta = {
	title: 'Controllers/WarnUnsaved',
} satisfies Meta

export const Edit = {
	name: 'Edit',
	render: (args: any) => ({
		Component: WarnUnsavedEdit as any,
		props: args,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export default meta
