import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = {
	title: 'Dashboard',
}

export const Basic: StoryObj<typeof meta> = {
	name: 'Basic',
	render: args => ({
		setup: () => ({ args }),
		template: 'Hi',
	}),
}

export default meta
