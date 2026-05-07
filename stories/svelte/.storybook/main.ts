import type { StorybookConfig } from '@storybook/svelte-vite'

export default {
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
} satisfies StorybookConfig
