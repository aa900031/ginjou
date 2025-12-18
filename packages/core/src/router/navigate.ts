import type { RecordKey } from '../query'
import type { Resource } from '../resource'
import type { RouterGoFn, RouterGoParams } from './go'
import { createResourcePath, resolveResource, ResourceActionType } from '../resource'

export interface Props {
	resource?: string
}

export interface ToPropsWithResource {
	resource?: string
	action: typeof ResourceActionType.List | typeof ResourceActionType.Create
	params?: Record<string, any>
}

export interface ToPropsWithResourceId {
	resource?: string
	action: typeof ResourceActionType.Edit | typeof ResourceActionType.Show
	id: RecordKey
	params?: Record<string, any>
}

export type ToProps
	= | ToPropsWithResource
		| ToPropsWithResourceId
		| RouterGoParams
		| false

export type ToFn = (
	props: ToProps,
) => void

export interface CreateToFnProps {
	go: RouterGoFn<unknown>
	getResourceFromProp: () => string | undefined
	resource: Resource | undefined
}

export function createToFn(
	{
		go,
		getResourceFromProp,
		resource: resourceContext,
	}: CreateToFnProps,
): ToFn {
	return function navigateTo(props) {
		if (props === false || props == null)
			return

		if (!('action' in props)) {
			return go(props)
		}

		switch (props.action) {
			case ResourceActionType.List:
			case ResourceActionType.Create: {
				const path = createResourcePath({
					resolved: resolveResource(resourceContext, { name: props.resource ?? getResourceFromProp() }),
					action: props.action,
					params: props.params,
				})
				if (path == null)
					return

				return go({
					to: path,
				})
			}
			case ResourceActionType.Edit:
			case ResourceActionType.Show: {
				const path = createResourcePath({
					resolved: resolveResource(resourceContext, { name: props.resource ?? getResourceFromProp() }),
					action: props.action,
					params: {
						id: props.id,
						...props.params,
					},
				})
				if (path == null)
					return

				return go({
					to: path,
				})
			}
		}
	}
}
