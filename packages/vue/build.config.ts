import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
	entries: [
		'src/index',
		'src/plugin',
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
