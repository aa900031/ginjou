export default defineAppConfig({
	docus: {
		locale: 'en',
	},
	header: {
		title: 'Ginjou',
	},
	ui: {
		prose: {
			codeIcon: {
				svelte: 'i-vscode-icons-file-type-svelte',
			},
		},
		contentSearchButton: {
			slots: {
				base: 'py-2.5 px-3',
			},
		},
	},
})
