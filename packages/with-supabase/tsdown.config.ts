import { DEFAULT_CONFIG } from '@ginjou/tsdown-config'
import { defineConfig } from 'tsdown'

export default defineConfig({
	...DEFAULT_CONFIG,
	platform: 'neutral',
	entry: [
		'src/index.ts',
	],
	external: [
		'@ginjou/core',
		'@supabase/supabase-js',
		'@supabase/postgrest-js',
	],
})
