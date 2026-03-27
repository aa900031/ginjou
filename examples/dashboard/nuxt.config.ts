export default defineNuxtConfig({
	modules: [
		'@nuxt/ui',
		'@ginjou/nuxt',
	],
	devtools: {
		enabled: true,
	},
	css: [
		'~/assets/css/main.css',
	],
})
