import type { Simplify } from 'type-fest'
import type { Filters, Pagination, RecordKey, Sorters } from '../query'
import type { ResourceActionTypeValues, ResourceDefinition } from '../resource'
import type { RouterLocation } from '../router'
import { omit } from 'lodash-unified'
import { parse as parseRegexparam } from 'regexparam'
import { ResourceActionType } from './action'

export type ResourceParseParams<
	TParams extends Record<string, any> = Record<string, any>,

	TPageParam = number,
> = Simplify<
	& TParams
	& {
		filters?: Filters
		sorters?: Sorters
		pagination?: Partial<Pagination<TPageParam>>
	}
>

export interface ResourceParseListResult<
	TParams extends Record<string, any> = Record<string, any>,

	TPageParam = number,
> {
	action: typeof ResourceActionType.List
	params?: ResourceParseParams<TParams, TPageParam>
}

export interface ResourceParseShowResult<
	TParams extends Record<string, any> = Record<string, any>,

	TPageParam = number,
> {
	action: typeof ResourceActionType.Show
	id: RecordKey
	params?: ResourceParseParams<TParams, TPageParam>
}

export interface ResourceParseEditResult<
	TParams extends Record<string, any> = Record<string, any>,

	TPageParam = number,
> {
	action: typeof ResourceActionType.Edit
	id: RecordKey
	params?: ResourceParseParams<TParams, TPageParam>
}

export interface ResourceParseCreateResult<
	TParams extends Record<string, any> = Record<string, any>,

	TPageParam = number,
> {
	action: typeof ResourceActionType.Create
	params?: ResourceParseParams<TParams, TPageParam>
}

export type ResourceParseResult<
	TParams extends Record<string, any> = Record<string, any>,

	TPageParam = number,
> =
	| ResourceParseListResult<TParams, TPageParam>
	| ResourceParseShowResult<TParams, TPageParam>
	| ResourceParseCreateResult<TParams, TPageParam>
	| ResourceParseEditResult<TParams, TPageParam>

export type ResourceParseFn<
	TParams extends Record<string, any> = Record<string, any>,

	TLocationMeta = unknown,
	TPageParam = number,
> = (
	location: RouterLocation<TLocationMeta>,
) => ResourceParseResult<TParams, TPageParam> | undefined

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

	const params = parseParams(location)

	switch (action) {
		case ResourceActionType.List:
		case ResourceActionType.Create:
			return {
				action,
				params,
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
				params,
			}
		}
		default:
			throw new Error('Nooo')
	}
}

function parseParams(
	location: RouterLocation,
): ResourceParseParams {
	const { params, query } = location
	const { current, perPage, filters, sorters } = query ?? {}
	const parsedCurrent = typeof current === 'string' ? Number.isNaN(+current) ? current : +current : undefined
	const parsedPerPage = typeof perPage === 'string' && !Number.isNaN(+perPage) ? +perPage : undefined
	const parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : undefined
	const parsedSorters = typeof sorters === 'string' ? JSON.parse(sorters) : undefined

	return {
		...params,
		pagination: parsedCurrent != null || parsedPerPage != null
			? { current: parsedCurrent as any, perPage: parsedPerPage }
			: undefined,
		filters: parsedFilters,
		sorters: parsedSorters,
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
