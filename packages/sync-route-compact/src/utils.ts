import * as JSURL from 'jsurl2'

export const stringifyOptions = { rich: true, short: true }

export function invalid(kind: string, value: unknown): never {
	throw new Error(`[@ginjou/sync-route-compact] Invalid ${kind}: ${JSON.stringify(value)}`)
}

export function parseArray(value: string, kind: string): unknown[] {
	if (value === '')
		return []

	const parsed = JSURL.parse<unknown>(value, { deURI: true })
	return Array.isArray(parsed) ? parsed : invalid(kind, parsed)
}
