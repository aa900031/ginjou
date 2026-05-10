import type { Simplify } from 'type-fest'
import type { RecordKey } from '../query'
import type { RouterLocation } from '../router'
import type { Controller } from './controller'
import { omit } from 'es-toolkit'
import { parse as parseRegexparam } from 'regexparam'
import * as ResourceAction from './resource-action'

export type Meta<
	TMetaExtends extends Record<string, any> = Record<string, any>,
> = Simplify<
	& {
		parent?: string
		hide?: boolean
		deletable?: boolean
		fetcherName?: string
	}
	& TMetaExtends
>

export type Raw<
	TMetaExtends extends Record<string, any> = Record<string, any>,
> = Simplify<
	& Partial<Record<
		ResourceAction.TypeValues,
		| string
		| ResourceAction.Parse
	>>
	& {
		name: string
		meta?: Meta<TMetaExtends>
	}
>

export interface ListResult {
	action: typeof ResourceAction.Type.List
}

export interface ShowResult {
	action: typeof ResourceAction.Type.Show
	id: RecordKey
}

export interface EditResult {
	action: typeof ResourceAction.Type.Edit
	id: RecordKey
}

export interface CreateResult {
	action: typeof ResourceAction.Type.Create
}

export type ParseResult
	= | ListResult
		| ShowResult
		| CreateResult
		| EditResult

export type ParseFn<
	TLocationMeta = unknown,
> = (
	location: RouterLocation<TLocationMeta>,
) => ParseResult | undefined

export type Resolved<
	TResourceMeta extends Record<string, any> = Record<string, any>,
> = Simplify<
	& ParseResult
	& {
		resource: Raw<TResourceMeta>
	}
> | {
	resource: Raw<TResourceMeta>
}

export interface ResolveParams<
	TLocationMeta = unknown,
> {
	name?: string
	location?: RouterLocation<TLocationMeta>
}

export function get<
	TResourceMeta extends Record<string, any> = Record<string, any>,
>(
	controller: Controller<TResourceMeta>,
	name: string | undefined,
): Raw<TResourceMeta> | undefined {
	if (!name)
		return

	const map = getResourceMap(controller)
	return map?.get(name)
}

export function resolve<
	TResourceMeta extends Record<string, any> = Record<string, any>,
	TLocationMeta = unknown,
>(
	controller: Controller<TResourceMeta> | undefined,
	params: ResolveParams<TLocationMeta>,
): Resolved<TResourceMeta> | undefined {
	if (!controller)
		return

	if (params.name) {
		const resource = get<TResourceMeta>(controller, params.name)
		if (resource) {
			const parsed = params.location
				? parse(resource, params.location)
				: undefined
			return {
				resource,
				...parsed,
			}
		}
	}

	if (params.location) {
		for (const resource of controller.resources) {
			const parsed = parse(resource, params.location)
			if (parsed) {
				return {
					resource,
					...parsed,
				}
			}
		}
	}
}

export function parse<
	TLocationMeta = unknown,
>(
	resource: Raw,
	location: RouterLocation<TLocationMeta>,
): ParseResult | undefined {
	const cache = getCache(resource, location)
	if (cache)
		return cache

	for (const action of Object.values(ResourceAction.Type)) {
		const target = resource[action]
		if (!target)
			continue

		const parsed = typeof target === 'string'
			? parseFromString(target, action, location)
			: target.parse(location) as ParseResult | undefined
		if (!parsed)
			continue

		setCache(resource, location, parsed)
		return parsed
	}
}

export interface GetNameParams {
	resource: Resolved | undefined
	resourceFromProp?: string | undefined
}

export function getName(
	{
		resource,
		resourceFromProp,
	}: GetNameParams,
): string | undefined {
	return resourceFromProp
		?? resource?.resource.name
}

export interface GetFetcherNameParams {
	resource: Resolved | undefined
	fetcherNameFromProp: string | undefined
}

export function getFetcherName(
	{
		resource,
		fetcherNameFromProp,
	}: GetFetcherNameParams,
): string | undefined {
	return fetcherNameFromProp ?? resource?.resource.meta?.fetcherName
}

const resourceMapCache = new WeakMap<Raw[], Map<string, Raw>>()

function getResourceMap<
	TResourceMeta extends Record<string, any> = Record<string, any>,
>(
	controller: Controller<TResourceMeta>,
): Map<string, Raw<TResourceMeta>> | undefined {
	if (!controller?.resources)
		return

	const cache = resourceMapCache.get(controller.resources) as Map<string, Raw<TResourceMeta>>
	if (cache)
		return cache

	const map = new Map<string, Raw<TResourceMeta>>()
	resourceMapCache.set(controller.resources, map)

	map.clear()
	for (const resource of controller.resources) {
		const key = [resource.name].join('-')
		map.set(key, resource)
	}

	return map
}

function parseFromString(
	pattern: string,
	action: ResourceAction.TypeValues,
	location: RouterLocation,
): ParseResult | undefined {
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
	action: ResourceAction.TypeValues,
	location: RouterLocation,
): ParseResult | undefined {
	const matched = pattern.exec(location.path)
	if (!matched)
		return

	switch (action) {
		case ResourceAction.Type.List:
		case ResourceAction.Type.Create:
			return {
				action,
			}
		case ResourceAction.Type.Edit:
		case ResourceAction.Type.Show: {
			const index = keys.indexOf('id')
			if (index < 0)
				throw new Error(`[@ginjou/core] Cannot parse '${action}' resource route because the path pattern does not include an ':id' parameter.`)

			const id = matched[index + 1]
			if (id == null)
				throw new Error(`[@ginjou/core] Cannot parse '${action}' resource route because the matched ':id' parameter is missing from path '${location.path}'.`)

			return {
				action,
				id,
			}
		}
		default:
			throw new Error(`[@ginjou/core] Unsupported resource action while parsing route: ${String(action)}`)
	}
}

function setCache(
	resource: Raw,
	location: RouterLocation,
	parsed: ParseResult,
): void {
	const hash = JSON.stringify(omit(location, ['meta']))
	const map = getLocationMap(resource)
	map[hash] = parsed
}

function getCache(
	resource: Raw,
	location: RouterLocation,
): ParseResult | undefined {
	const hash = JSON.stringify(omit(location, ['meta']))
	return getLocationMap(resource)[hash] || undefined
}

const locationCache = new WeakMap<Raw, Record<string, ParseResult>>()

function getLocationMap(
	resource: Raw,
): Record<string, ParseResult> {
	const cache = locationCache.get(resource)
	if (cache)
		return cache

	const map = {}
	locationCache.set(resource, map)

	return map
}
