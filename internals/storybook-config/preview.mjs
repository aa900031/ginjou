export function withDarkClass(story, context) {
	const bg = context.globals?.backgrounds
	const name = typeof bg === 'string' ? bg : bg?.value
	document.documentElement.classList.toggle('dark', name === 'dark')
	return story()
}

export const parameters = {
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/,
		},
	},
	options: {
		storySort: {
			order: [
				'Controllers',
				'Query',
			],
		},
	},
}
