import { fileURLToPath, URL } from 'node:url'

export default {
	'@ginjou/vue': fileURLToPath(new URL('../../packages/vue/src', import.meta.url)),
	'@ginjou/core': fileURLToPath(new URL('../../packages/core/src', import.meta.url)),
}
