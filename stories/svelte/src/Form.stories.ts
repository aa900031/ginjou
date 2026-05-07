import type { Meta, StoryObj } from '@storybook/svelte-vite'
import FormCreate from './FormCreate.svelte'
import FormEdit from './FormEdit.svelte'
import { createPostHandlers } from './utils/posts'
import { args as MutationModeArgs, argTypes as MutationModeArgTypes } from './utils/sb-args/mutation-mode'
import { argTypes as RedirectArgTypes } from './utils/sb-args/redirect'

const meta: Meta = {
	title: 'Controllers/Form',
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
}

export const Create: StoryObj<typeof meta> = {
	name: 'Create',
	render: args => ({
		Component: FormCreate,
		props: args,
	}),
	argTypes: {
		...RedirectArgTypes,
	},
}

export const Edit: StoryObj<typeof meta> = {
	name: 'Edit',
	render: args => ({
		Component: FormEdit,
		props: args,
	}),
	argTypes: {
		...MutationModeArgTypes,
		...RedirectArgTypes,
	},
	args: {
		...MutationModeArgs,
	},
}

export default meta
