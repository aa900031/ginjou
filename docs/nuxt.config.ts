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
