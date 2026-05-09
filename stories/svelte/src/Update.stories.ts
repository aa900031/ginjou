import type { Meta, StoryObj } from '@storybook/svelte-vite'
import UpdateMany from './UpdateMany.svelte'
import UpdateOne from './UpdateOne.svelte'
import { createPostHandlers } from './utils/posts'

const meta = {
	title: 'Query/Update',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => ({
		Component: UpdateOne as any,
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
		Component: UpdateMany as any,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export default meta
