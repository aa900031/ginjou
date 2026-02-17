import * as path from 'node:path'
import { defineConfig } from 'tsdown'

export const DEFAULT_CONFIG = defineConfig({
	format: ['esm', 'cjs'],
	clean: true,
	exports: {
		devExports: true,
		customExports(exports,	ctx) {
			const formats = [['import', 'es'], ['require', 'cjs']]
			const pkgRoot = path.dirname(ctx.pkg.packageJsonPath)

			for (const [output, config] of Object.entries(exports)) {
				if (config == null || typeof config !== 'object')
					continue
				for (const [name, format] of formats) {
					const configValue = config[name]
					const chunks = ctx.chunks[format]
					if (typeof configValue !== 'string' || chunks == null)
						continue
					for (const chunk of chunks) {
						if (chunk.type === 'chunk' && chunk.name.endsWith('.d')) {
							exports[output][name] = {
								default: configValue,
								types: `./${path.relative(pkgRoot, path.join(chunk.outDir, chunk.fileName))}`,
							}
						}
					}
				}
			}

			return exports
		},
	},
	dts: {
		compilerOptions: {
			composite: false,
			preserveSymlinks: false,
		},
		tsconfig: './tsconfig.app.json',
	},
})
