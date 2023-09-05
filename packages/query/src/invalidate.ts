import type { QueryClient } from '@tanstack/query-core'
import type { RecordKey } from './fetcher'
import { genGetListQueryKey } from './get-list'
import { genGetManyQueryKey } from './get-many'
import { genResourceQueryKey } from './resource'
import { genGetOneQueryKey } from './get-one'

export const InvalidateTarget = {
	All: 'all',
	Resource: 'resource',
	List: 'list',
	Many: 'many',
	One: 'one',
} as const

export type InvalidateTargetType = typeof InvalidateTarget[keyof typeof InvalidateTarget]

export type TriggerInvalidatesProps =
	& TriggerInvalidateProps
	& {
		invalidates: InvalidateTargetType[] | false
	}

export function triggerInvalidates(
	props: TriggerInvalidatesProps,
	queryClient: QueryClient,
) {
	const { invalidates } = props

	if (invalidates === false || !invalidates.length)
		return

	for (const invalidate of invalidates) {
		triggerInvalidate(
			props as any,
			invalidate as any,
			queryClient,
		)
	}
}

export interface TriggerInvalidateAllProps {
	fetcherName?: string
}

export interface TriggerInvalidateResourceProps {
	resource?: string
	fetcherName?: string
}

export interface TriggerInvalidateListProps {
	resource: string
	fetcherName?: string
}

export interface TriggerInvalidateManyProps {
	resource: string
	fetcherName?: string
}

export type TriggerInvalidateOneProps =
	| {
		resource: string
		id: RecordKey
		fetcherName?: string
	}
	| {
		resource: string
		ids: RecordKey[]
		fetcherName?: string
	}

export type TriggerInvalidateProps =
	| TriggerInvalidateAllProps
	| TriggerInvalidateResourceProps
	| TriggerInvalidateListProps
	| TriggerInvalidateManyProps
	| TriggerInvalidateOneProps

export function triggerInvalidate(
	props: TriggerInvalidateAllProps,
	target: typeof InvalidateTarget.All,
	queryClient: QueryClient,
): void

export function triggerInvalidate(
	props: TriggerInvalidateResourceProps,
	target: typeof InvalidateTarget.Resource,
	queryClient: QueryClient,
): void

export function triggerInvalidate(
	props: TriggerInvalidateListProps,
	target: typeof InvalidateTarget.List,
	queryClient: QueryClient,
): void

export function triggerInvalidate(
	props: TriggerInvalidateManyProps,
	target: typeof InvalidateTarget.Many,
	queryClient: QueryClient,
): void

export function triggerInvalidate(
	props: TriggerInvalidateOneProps,
	target: typeof InvalidateTarget.One,
	queryClient: QueryClient,
): void

export function triggerInvalidate(
	props: any,
	target: InvalidateTargetType,
	queryClient: QueryClient,
): void {
	switch (target) {
		case InvalidateTarget.All:
			queryClient.invalidateQueries([props.fetcherName ?? 'default'])
			break
		case InvalidateTarget.List:
			queryClient.invalidateQueries(genGetListQueryKey(props))
			break
		case InvalidateTarget.Many: {
			const { resource } = props
			if (resource == null)
				throw new Error('`resource` is required')

			queryClient.invalidateQueries(genGetManyQueryKey({
				...props,
				resource,
			}))
			break
		}
		case InvalidateTarget.Resource: {
			const { resource } = props
			if (resource == null)
				throw new Error('`resource` is required')

			queryClient.invalidateQueries(genResourceQueryKey({
				...props,
				resource,
			}))
			break
		}
		case InvalidateTarget.One: {
			const { resource, id, ids } = props
			if (resource == null)
				throw new Error('`resource` is required')

			if (id) {
				queryClient.invalidateQueries(
					genGetOneQueryKey({
						...props,
						resource,
						id,
					}),
				)
			}
			else if (ids) {
				for (const id of ids) {
					queryClient.invalidateQueries(
						genGetOneQueryKey({
							...props,
							resource,
							id,
						}),
					)
				}
			}
			else {
				queryClient.invalidateQueries(
					genGetOneQueryKey({
						...props,
						resource,
					}),
				)
			}

			break
		}
		default:
			break
	}
}
