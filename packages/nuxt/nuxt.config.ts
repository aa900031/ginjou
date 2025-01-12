import { fileURLToPath, URL } from 'node:url'

export default {
	alias: {
		'@ginjou/vue/plugin': fileURLToPath(new URL('../vue/src/plugin', import.meta.url)),
	},
}
