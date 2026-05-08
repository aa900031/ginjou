import type { RouterGoParams, RouterLocation } from '@ginjou/core'

export type QueryParser = (qs: string) => Record<string, string | null | (string | null)[]>

export type QueryStringifier = (query: Record<string, string | number | null | undefined | (string | null)[]>) => string

export function defaultParseQuery(qs: string): Record<string, string | null | (string | null)[]> {
	const params = new URLSearchParams(qs)
	const result: Record<string, string | null | (string | null)[]> = {}
	for (const key of params.keys()) {
		const values = params.getAll(key)
		result[key] = values.length === 1 ? (values[0] ?? null) : values
	}
	return result
}

export function defaultStringifyQuery(query: Record<string, string | number | null | undefined | (string | null)[]>): string {
	const qs = new URLSearchParams()
	for (const [key, value] of Object.entries(query)) {
		if (value == null)
			continue
		if (Array.isArray(value)) {
			for (const v of value) {
				if (v != null)
					qs.append(key, v)
			}
		}
		else {
			qs.set(key, String(value))
		}
	}
	return qs.toString()
}

export function toLocation(
	location: string | undefined,
	querystring: string | undefined,
	params: Record<string, string | string[]> | Record<string, string> | RegExpExecArray | null | undefined,
	parseQuery: QueryParser,
): RouterLocation {
	return {
		path: location ?? '/',
		params: normalizeParams(params),
		query: querystring ? parseQuery(querystring) : undefined,
	}
}

function normalizeParams(
	params: Record<string, string | string[]> | Record<string, string> | RegExpExecArray | null | undefined,
): Record<string, string | string[]> | undefined {
	if (params == null)
		return undefined
	if (Array.isArray(params))
		return (params as RegExpExecArray).groups ?? undefined
	return params as Record<string, string | string[]>
}

export function buildPath(
	goParams: RouterGoParams,
	currentQuerystring: string | undefined,
	parseQuery: QueryParser,
	stringifyQuery: QueryStringifier,
): string {
	const { to = '/', query, hash, keepQuery } = goParams

	const currentQuery = keepQuery && currentQuerystring ? parseQuery(currentQuerystring) : {}
	const mergedQuery: Record<string, string | number | null | undefined | (string | null)[]> = {
		...currentQuery,
		...query,
	}

	const qsStr = stringifyQuery(mergedQuery)

	return `${to}${qsStr ? `?${qsStr}` : ''}${hash ? `#${hash}` : ''}`
}
