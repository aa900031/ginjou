import type { Controller } from '../controller'
import type { RecordKey } from '../query'
import type { RouterGoFn, RouterGoParams } from './router'
import { Resource, ResourceAction, ResourcePath } from '../controller'

export interface Props {
	resource?: string
}

export interface ToPropsWithResource {
	resource?: string
	action: typeof ResourceAction.Type.List | typeof ResourceAction.Type.Create
	params?: Record<string, any>
}

export interface ToPropsWithResourceId {
	resource?: string
	action: typeof ResourceAction.Type.Edit | typeof ResourceAction.Type.Show
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
	controller: Controller | undefined
}

export function createToFn(
	{
		go,
		getResourceFromProp,
		controller,
	}: CreateToFnProps,
): ToFn {
	return function navigateTo(props) {
		if (props === false || props == null)
			return

		if (!('action' in props)) {
			return go(props)
		}

		switch (props.action) {
			case ResourceAction.Type.List:
			case ResourceAction.Type.Create: {
				const path = ResourcePath.get({
					resolved: Resource.resolve(controller, { name: props.resource ?? getResourceFromProp() }),
					action: props.action,
					params: props.params,
				})
				if (path == null)
					return

				return go({
					to: path,
				})
			}
			case ResourceAction.Type.Edit:
			case ResourceAction.Type.Show: {
				const path = ResourcePath.get({
					resolved: Resource.resolve(controller, { name: props.resource ?? getResourceFromProp() }),
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
