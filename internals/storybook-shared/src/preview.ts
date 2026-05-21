export function withDarkClass(story: () => any, context: any): any {
	const bg = context.globals?.backgrounds
	const name = typeof bg === 'string' ? bg : bg?.value
	document.documentElement.classList.toggle('dark', name === 'dark')
	return story()
}
