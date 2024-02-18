import '@storybook/types'
import { mergeConfig } from 'vite'
import type { UserConfigFn } from 'vite'
import type { StorybookConfig } from '@storybook/vue3-vite'
import ViteConfig from './vite.config'

export default {
	stories: [
		'../src/**/*.mdx',
		'../src/**/*.stories.@(js|jsx|ts|tsx)',
	],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@storybook/addon-interactions',
	],
	framework: {
		name: '@storybook/vue3-vite',
		options: {},
	},
	docs: {
		autodocs: 'tag',
	},
	viteFinal: async (config, opts) => {
		return mergeConfig(
			config,
			await (ViteConfig as UserConfigFn)({
				command: 'serve',
				mode: opts.configType!.toLowerCase(),
			}),
		)
	},
} satisfies StorybookConfig
