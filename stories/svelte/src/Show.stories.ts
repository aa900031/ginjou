import type { Meta, StoryObj } from '@storybook/svelte-vite'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import ShowBasic from './ShowBasic.svelte'

const meta = {
	title: 'Controllers/Show',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => ({
		Component: ShowBasic as any,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export default meta
