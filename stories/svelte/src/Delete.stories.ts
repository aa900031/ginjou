import type { Meta, StoryObj } from '@storybook/svelte-vite'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import DeleteMany from './DeleteMany.svelte'
import DeleteOne from './DeleteOne.svelte'

const meta = {
	title: 'Query/Delete',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => ({
		Component: DeleteOne as any,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export const Many = {
	name: 'Many',
	render: () => ({
		Component: DeleteMany as any,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export default meta
