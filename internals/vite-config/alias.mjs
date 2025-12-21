import { fileURLToPath, URL } from 'node:url'

export default {
	'@ginjou/vue': fileURLToPath(new URL('../../packages/vue/src', import.meta.url)),
	'@ginjou/core': fileURLToPath(new URL('../../packages/core/src', import.meta.url)),
	'@ginjou/with-vue-router': fileURLToPath(new URL('../../packages/with-vue-router/src', import.meta.url)),
	'@ginjou/with-vue-i18n': fileURLToPath(new URL('../../packages/with-vue-i18n/src', import.meta.url)),
	'@ginjou/with-rest-api': fileURLToPath(new URL('../../packages/with-rest-api/src', import.meta.url)),
	'@ginjou/with-supabase': fileURLToPath(new URL('../../packages/with-supabase/src', import.meta.url)),
}
