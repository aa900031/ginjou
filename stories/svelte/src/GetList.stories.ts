import type { Meta, StoryObj } from '@storybook/svelte-vite'
import GetList from './GetList.svelte'
import { createPostHandlers } from './utils/posts'

const meta = {
	title: 'Query/GetList',
	component: GetList,
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies Meta<typeof GetList>

export default meta

type Story = StoryObj<typeof meta>

export const Basic = {} satisfies Story
