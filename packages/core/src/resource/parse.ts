import type { RecordKey } from '../query'
import type { ResourceActionTypeValues, ResourceDefinition } from '../resource'
import type { RouterLocation } from '../router'
import { omit } from 'lodash-unified'
import { parse as parseRegexparam } from 'regexparam'
import { ResourceActionType } from './action'

export interface ResourceParseListResult {
	action: typeof ResourceActionType.List
}

export interface ResourceParseShowResult {
	action: typeof ResourceActionType.Show
	id: RecordKey
}

export interface ResourceParseEditResult {
	action: typeof ResourceActionType.Edit
	id: RecordKey
}

export interface ResourceParseCreateResult {
	action: typeof ResourceActionType.Create
}

export type ResourceParseResult =
	| ResourceParseListResult
	| ResourceParseShowResult
	| ResourceParseCreateResult
	| ResourceParseEditResult

export type ResourceParseFn<
	TLocationMeta = unknown,
> = (
	location: RouterLocation<TLocationMeta>,
) => ResourceParseResult | undefined

export function parseResource<
	TLocationMeta = unknown,
>(
	resource: ResourceDefinition,
	location: RouterLocation<TLocationMeta>,
): ResourceParseResult | undefined {
	const cache = getCache(resource, location)
	if (cache)
		return cache

	for (const action of Object.values(ResourceActionType)) {
		const target = resource[action]
		if (!target)
			continue

		const parsed = typeof target === 'string'
			? parseFromString(target, action, location)
			: target.parse(location)
		if (!parsed)
			continue

		setCache(resource, location, parsed)
		return parsed
	}
}

function parseFromString(
	pattern: string,
	action: ResourceActionTypeValues,
	location: RouterLocation,
): ResourceParseResult | undefined {
	const parsed = parseRegexparam(pattern)
	return parseFromRegExp(
		parsed.pattern,
		parsed.keys,
		action,
		location,
	)
}

function parseFromRegExp(
	pattern: RegExp,
	keys: string[],
	action: ResourceActionTypeValues,
	location: RouterLocation,
): ResourceParseResult | undefined {
	const matched = pattern.exec(location.path)
	if (!matched)
		return

	switch (action) {
		case ResourceActionType.List:
		case ResourceActionType.Create:
			return {
				action,
			}
		case ResourceActionType.Edit:
		case ResourceActionType.Show: {
			const index = keys.indexOf('id')
			if (index < 0)
				throw new Error('No')

			const id = matched[index + 1]
			if (id == null)
				throw new Error('No')

			return {
				action,
				id,
			}
		}
		default:
			throw new Error('Nooo')
	}
}

function setCache(
	resource: ResourceDefinition,
	location: RouterLocation,
	parsed: ResourceParseResult,
) {
	const hash = JSON.stringify(omit(location, 'meta'))
	const map = getLocationMap(resource)
	map[hash] = parsed
}

function getCache(
	resource: ResourceDefinition,
	location: RouterLocation,
): ResourceParseResult | undefined {
	const hash = JSON.stringify(omit(location, 'meta'))
	return getLocationMap(resource)[hash] || undefined
}

const cached = new WeakMap<ResourceDefinition, Record<string, ResourceParseResult>>()

function getLocationMap(
	resource: ResourceDefinition,
): Record<string, ResourceParseResult> {
	const cache = cached.get(resource)
	if (cache)
		return cache

	const map = {}
	cached.set(resource, map)

	return map
}
