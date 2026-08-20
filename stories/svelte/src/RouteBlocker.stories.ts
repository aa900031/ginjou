import type { Meta, StoryObj } from '@storybook/svelte-vite'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import RouteBlocker from './RouteBlocker.svelte'

const meta = {
	title: 'Router/RouteBlocker',
} satisfies Meta

export const Blocker = {
	name: 'Blocker',
	render: (args: any) => ({
		Component: RouteBlocker as any,
		props: args,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export default meta
