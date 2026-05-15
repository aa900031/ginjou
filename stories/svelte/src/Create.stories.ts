import type { Meta, StoryObj } from '@storybook/svelte-vite'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import CreateMany from './CreateMany.svelte'
import CreateOne from './CreateOne.svelte'

const meta = {
	title: 'Query/Create',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => ({
		Component: CreateOne as any,
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
		Component: CreateMany as any,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export default meta
