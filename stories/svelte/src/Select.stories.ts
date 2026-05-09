import type { Meta, StoryObj } from '@storybook/svelte-vite'
import SelectBasic from './SelectBasic.svelte'
import { createPostHandlers } from './utils/posts'

const meta = {
	title: 'Controllers/Select',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => ({
		Component: SelectBasic as any,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export default meta
