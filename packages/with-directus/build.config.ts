import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
	entries: [
		'src/index',
	],
	clean: true,
	declaration: true,
	rollup: {
		emitCJS: true,
		dts: {
			respectExternal: true,
			compilerOptions: {
				composite: false,
				preserveSymlinks: false,
			},
			tsconfig: './tsconfig.app.json',
		},
	},
	externals: [
		'@ginjou/core',
		'@directus/sdk',
	],
})
