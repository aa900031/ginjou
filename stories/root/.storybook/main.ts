import type { StorybookConfig } from '@storybook/react-vite'
import remarkGfm from 'remark-gfm'

export default {
	stories: [
		'../src/**/*.mdx',
		'../src/**/*.stories.@(js|jsx|ts|tsx)',
	],
	addons: [
		{
			name: '@storybook/addon-docs',
			options: {
				mdxPluginOptions: {
					mdxCompileOptions: {
						remarkPlugins: [
							remarkGfm,
						],
					},
				},
			},
		},
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
