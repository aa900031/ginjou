import { customExports } from '@aa900031/tsdown-config'
import { defineConfig } from 'tsdown'

export const DEFAULT_CONFIG = defineConfig({
	format: ['esm', 'cjs'],
	clean: true,
	exports: {
		devExports: true,
		customExports,
	},
	dts: {
		compilerOptions: {
			composite: false,
			preserveSymlinks: false,
		},
		tsconfig: './tsconfig.app.json',
	},
})
