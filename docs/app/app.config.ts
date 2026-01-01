export default defineAppConfig({
	docus: {
		locale: 'en',
	},
	header: {
		title: 'Ginjou',
	},
	ui: {
		colors: {
			primary: 'brand',
		},
		prose: {
			codeIcon: {
				svelte: 'i-vscode-icons-file-type-svelte',
			},
			card: {
				slots: {
					icon: 'size-7',
				},
			},
		},
		contentSearchButton: {
			slots: {
				base: 'py-2.5 px-3',
			},
		},
		pageFeature: {
			slots: {
				leadingIcon: 'size-6.5',
			},
		},
	},
})
