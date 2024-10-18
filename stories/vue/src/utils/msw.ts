import type { Loader } from '@storybook/vue3'
import type { RequestHandler } from 'msw'
import type { SetupWorker } from 'msw/browser'
import { setupWorker } from 'msw/browser'

let worker: SetupWorker

export function createMsw(
	handlers: RequestHandler[],
): Loader {
	return async () => {
		if (!worker) {
			worker = setupWorker()
			await worker.start({
				onUnhandledRequest: handleUnhandledRequest,
			})
		}

		worker.resetHandlers()
		worker.use(...handlers)
	}
}

// eslint-disable-next-line regexp/no-unused-capturing-group
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

function handleUnhandledRequest(
	request: Request,
	print: { warning: () => void },
) {
	if (shouldFilterUrl(request.url))
		return

	print.warning()
}
