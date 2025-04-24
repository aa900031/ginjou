import type { StorybookConfig } from '@storybook/react-vite'

export default {
	stories: [
		'../src/**/*.mdx',
		'../src/**/*.stories.@(js|jsx|ts|tsx)',
	],
	addons: [
		'@storybook/addon-essentials',
	],
	framework: {
		name: '@storybook/react-vite',
		options: {},
	},
	refs: (config, { configType }) => {
		switch (configType) {
			case 'DEVELOPMENT':
				return {
					vue: {
						title: 'Vue',
						url: 'http://localhost:6007',
					},
				}

			default:
				return {
					vue: {
						title: 'Vue',
						url: '/vue',
					},
				}
		}
	},
} satisfies StorybookConfig
