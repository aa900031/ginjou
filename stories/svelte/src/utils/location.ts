import type { RouterLocation } from '@ginjou/core'

const ORIGIN = 'https://storybook.local'

export function formatLocation(location: RouterLocation | undefined): string {
	if (!location)
		return '/'

	return toHref(location)
}

function toHref(location: RouterLocation): string {
	const url = new URL(location.path, ORIGIN)

	for (const [key, value] of Object.entries(location.query ?? {})) {
		if (Array.isArray(value)) {
			for (const item of value)
				url.searchParams.append(key, item ?? '')
			continue
		}

		url.searchParams.set(key, value ?? '')
	}

	if (location.hash)
		url.hash = normalizeHash(location.hash)

	return decodeURIComponent(`${url.pathname}${url.search}${url.hash}`)
}

function normalizeHash(hash: string): string {
	return hash.startsWith('#') ? hash : `#${hash}`
}
