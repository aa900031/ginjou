import type { Loader } from '@storybook/vue3'
import type { RequestHandler } from 'msw'
import type { InitializeOptions } from 'msw-storybook-addon'
import { getWorker, initialize, mswLoader } from 'msw-storybook-addon'

export function createMsw(
	handlers: RequestHandler[],
	options?: InitializeOptions,
): Loader {
	return (ctx) => {
		if (!safeGetWorker()) {
			initialize({
				serviceWorker: {
					url: './mockServiceWorker.js',
				},
				...options,
			}, handlers)
		}
		return mswLoader(ctx)
	}
}

function safeGetWorker() {
	try {
		return getWorker()
	}
	catch {
		// Nothing
	}
}
