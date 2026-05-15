import { defineMain } from '@storybook/svelte-vite/node'

export default defineMain({
	stories: [
		'../src/**/*.stories.@(js|ts|svelte)',
	],
	addons: [
		'@storybook/addon-docs',
	],
	framework: {
		name: '@storybook/svelte-vite',
		options: {},
	},
})
