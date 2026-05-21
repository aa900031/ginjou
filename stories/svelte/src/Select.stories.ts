import type { Meta, StoryObj } from '@storybook/svelte-vite'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import SelectBasic from './SelectBasic.svelte'

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
