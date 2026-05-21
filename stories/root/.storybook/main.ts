import { defineMain } from '@storybook/react-vite/node'
import remarkGfm from 'remark-gfm'

export default defineMain({
	staticDirs: [
		'../public',
	],
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
			svelte: {
				title: 'Svelte',
				url: urls.svelte,
				expanded: false,
			},
		}
	},
})

function getRefsUrl(
	type: string | undefined,
): Record<string, string> {
	switch (type) {
		case 'DEVELOPMENT':
			return {
				svelte: 'http://localhost:6008',
				vue: 'http://localhost:6007',
			}

		default:
			return {
				svelte: '/svelte',
				vue: '/vue',
			}
	}
}
