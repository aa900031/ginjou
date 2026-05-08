const DEFAULT_HIGHLIGHT = ['bash', 'diff', 'json', 'js', 'ts', 'html', 'css', 'vue', 'shell', 'mdc', 'md', 'yaml'] as const

export default defineNuxtConfig({
	extends: [
		'docus',
	],
	modules: [
		'@barzhsieh/nuxt-content-mermaid',
	],
	devtools: {
		enabled: true,
	},
	content: {
		build: {
			markdown: {
				highlight: {
					langs: [...DEFAULT_HIGHLIGHT, 'svelte'],
					theme: {
						default: 'github-light',
						dark: 'github-dark',
						sepia: 'monokai',
					},
				},
			},
		},
	},
	contentMermaid: {
		theme: {
			light: 'default',
			dark: 'dark',
		},
	},
	vite: {
		optimizeDeps: {
			include: [
				'mermaid',
			],
		},
	},
	site: {
		name: 'Ginjou',
	},
	css: [
		'~/assets/css/main.css',
	],
	llms: {
		domain: 'https://ginjou.pages.dev',
	},
})
