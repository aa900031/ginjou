import type { CreateManyResult, CreateResult, DeleteManyResult, DeleteOneResult, Meta, RecordKey, UpdateManyResult, UpdateResult } from './fetcher'
import { uniq } from 'lodash-unified'

export interface PublishPayload {
	ids: RecordKey[] | undefined
}

export function createPublishPayloadByOne(
	props: {
		id: RecordKey
	} | Record<string, any>,
	data: CreateResult | UpdateResult | DeleteOneResult,
): PublishPayload {
	const idFromProp = 'id' in props ? props.id : undefined
	const idFromData = data.data.id
	const id = idFromData ?? idFromProp

	return {
		ids: id == null ? undefined : [id],
	}
}

export function createPublishPayloadByMany(
	props: {
		ids: RecordKey[]
	} | Record<string, any>,
	data: CreateManyResult | UpdateManyResult | DeleteManyResult,
): PublishPayload {
	const idsFromData = data.data.map(item => item.id).filter(Boolean)
	const idsFromProps = 'ids' in props ? props.ids : []
	const ids = uniq([
		...idsFromData,
		...idsFromProps,
	])

	return {
		ids: ids.length > 0 ? ids as RecordKey[] : undefined,
	}
}

export type PublishMeta =
	& Record<string, any>
	& {
		fetcherName: string
	}

export function createPublishMeta(
	props: {
		fetcherName: string
		meta?: Meta
	},
): PublishMeta {
	return {
		...props.meta,
		fetcherName: props.fetcherName,
	}
}
