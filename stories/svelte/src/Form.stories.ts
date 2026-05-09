import type { Meta, StoryObj } from '@storybook/svelte-vite'
import FormCreate from './FormCreate.svelte'
import FormEdit from './FormEdit.svelte'
import { createPostHandlers } from './utils/posts'
import { args as MutationModeArgs, argTypes as MutationModeArgTypes } from './utils/sb-args/mutation-mode'
import { argTypes as RedirectArgTypes } from './utils/sb-args/redirect'

const meta = {
	title: 'Controllers/Form',
} satisfies Meta

export const Create = {
	name: 'Create',
	render: (args: any) => ({
		Component: FormCreate as any,
		props: args,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
	argTypes: {
		...RedirectArgTypes,
	},
} satisfies StoryObj<typeof meta>

export const Edit = {
	name: 'Edit',
	render: (args: any) => ({
		Component: FormEdit as any,
		props: args,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
	argTypes: {
		...MutationModeArgTypes,
		...RedirectArgTypes,
	},
	args: {
		...MutationModeArgs,
	},
} satisfies StoryObj<typeof meta>

export default meta
