import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
	entries: [
		'src/index',
		'src/query',
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
})
