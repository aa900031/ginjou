import type { Decorator } from '@storybook/svelte-vite'

export const withBackgroundClass: Decorator = (story, context) => {
	const bg = context.globals?.backgrounds
	const name = typeof bg === 'string' ? bg : bg?.value
	document.documentElement.classList.toggle('dark', name === 'dark')
	return story()
}
