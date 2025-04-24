import type { StorybookConfig } from '@storybook/react-vite'
import '@storybook/core'

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
		const urls = getRefsUrl(configType)
		return {
			vue: {
				title: 'Vue',
				url: urls.vue,
				expanded: false,
			},
		}
	},
} satisfies StorybookConfig

function getRefsUrl(
	type: string | undefined,
) {
	switch (type) {
		case 'DEVELOPMENT':
			return {
				vue: 'http://localhost:6007',
			}

		default:
			return {
				vue: '/vue',
			}
	}
}
