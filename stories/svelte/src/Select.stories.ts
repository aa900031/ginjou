import type { Meta, StoryObj } from '@storybook/svelte-vite'
import SelectBasic from './SelectBasic.svelte'
import { createPostHandlers } from './utils/posts'

const meta = {
	title: 'Controllers/Select',
	component: SelectBasic,
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies Meta<typeof SelectBasic>

export default meta

type Story = StoryObj<typeof meta>

export const Basic = {} satisfies Story
