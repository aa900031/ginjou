import type { RequestHandler } from 'msw'
import { setupWorker } from 'msw/browser'
import type { Loader } from '@storybook/vue3'

export function createMsw(
	handlers: RequestHandler[],
): Loader {
	return async () => {
		const worker = setupWorker(...handlers)

		await worker.start({
			onUnhandledRequest: (
				request,
				print,
			) => {
				if (shouldFilterUrl(request.url))
					return

				print.warning()
			},
		})
	}
}

const fileExtensionRE = /\.(js|jsx|ts|tsx|mjs|woff|woff2|ttf|otf|eot|vue)$/
const urlSubstrings = [
	'sb-common-assets',
	'node_modules',
	'node-modules',
	'hot-update.json',
	'__webpack_hmr',
	'sb-vite',
]

function shouldFilterUrl(url: string): boolean {
	if (fileExtensionRE.test(url))
		return true

	const isStorybookRequest = urlSubstrings.some(
		substring => url.includes(substring),
	)
	if (isStorybookRequest)
		return true

	return false
}
