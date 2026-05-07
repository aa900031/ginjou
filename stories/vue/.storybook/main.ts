import type { StorybookConfig } from '@storybook/vue3-vite'

export default {
	stories: [
		'../src/**/*.mdx',
		'../src/**/*.stories.@(js|ts)',
	],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-docs',
	],
	framework: {
		name: '@storybook/vue3-vite',
		options: {},
	},
} satisfies StorybookConfig
