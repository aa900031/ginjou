import type { ChunkFileNamesFunction, NormalizedInputOptions, OutputOptions, Plugin } from 'rolldown'
import path from 'node:path'
import { DEFAULT_CONFIG } from '@ginjou/tsdown-config'
import { defineConfig } from 'tsdown'

export default defineConfig({
	...DEFAULT_CONFIG,
	platform: 'browser',
	entry: [
		'src/index.ts',
	],
	plugins: [
		preserveSvelteJs(),
	],
	external: [
		'@ginjou/core',
		'@tanstack/query-core',
		'@tanstack/svelte-query',
		'tanstack-query-callbacks',
		'svelte',
	],
})

function preserveSvelteJs(): Plugin {
	let svelteChunkName = 'index.svelte'

	return {
		name: 'preserve-svelte-js',

		buildStart(options: NormalizedInputOptions) {
			const input = options.input
			let entryName = 'index'
			if (Array.isArray(input) && input.length > 0) {
				entryName = path.basename(input[0], path.extname(input[0]))
			}
			else if (typeof input === 'object' && input !== null) {
				const first = Object.keys(input)[0]
				if (first)
					entryName = first
			}
			svelteChunkName = `${entryName}.svelte`
		},

		outputOptions(options: OutputOptions) {
			const chunkName = svelteChunkName

			// Extract JS extension from entryFileNames (tsdown sets it to '[name].js', '[name].cjs', etc.)
			let jsExt = '.js'
			if (typeof options.entryFileNames === 'string') {
				const m = options.entryFileNames.match(/(\.[cm]?js)$/)
				if (m)
					jsExt = m[1]
			}

			const origChunkFileNames = options.chunkFileNames
			const chunkFileNames: ChunkFileNamesFunction = (chunk) => {
				if (chunk.name === chunkName)
					return `${chunkName}${jsExt}`
				if (typeof origChunkFileNames === 'function')
					return origChunkFileNames(chunk)
				if (typeof origChunkFileNames === 'string')
					return origChunkFileNames
				return `[name]-[hash]${jsExt}`
			}

			return {
				...options,
				chunkFileNames,
				manualChunks(id: string) {
					if (/\.svelte\.[cm]?[tj]s$/.test(id))
						return chunkName
				},
			}
		},
	}
}
