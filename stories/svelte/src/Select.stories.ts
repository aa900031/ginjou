import type { Meta, StoryObj } from '@storybook/svelte-vite'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import SelectBasic from './SelectBasic.svelte'
import SelectMultiple from './SelectMultiple.svelte'

const meta = {
	component: SelectBasic,
	title: 'Controllers/Select',
} satisfies Meta<typeof SelectBasic>

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

export const Multiple = {
	name: 'Multiple',
	render: () => ({
		Component: SelectMultiple as any,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export default meta
