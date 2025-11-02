import type { RecordKey } from '../query'
import type { ResolvedResource, Resource } from '../resource'
import type { RouterGoFn, RouterGoParams } from './go'
import { createResourcePath, resolveResource, ResourceActionType } from '../resource'

export interface NavigateToResourceProps {
	resource?: string
	action: typeof ResourceActionType.List | typeof ResourceActionType.Create
	params?: Record<string, any>
}

export interface NavigateToResourceWithIdProps {
	resource?: string
	action: typeof ResourceActionType.Edit | typeof ResourceActionType.Show
	id: RecordKey
	params?: Record<string, any>
}

export type NavigateToProps
	= | NavigateToResourceProps
		| NavigateToResourceWithIdProps
		| RouterGoParams
		| false

export type NavigateToFn = (
	props: NavigateToProps,
) => void

export interface CreateNavigateToProps {
	go: RouterGoFn
	getResource: () => ResolvedResource | undefined
	resourceContext: Resource | undefined
}

export function createNavigateToFn(
	{
		go,
		getResource,
		resourceContext,
	}: CreateNavigateToProps,
): NavigateToFn {
	return function navigateTo(props) {
		if (props === false)
			return

		if (props != null && typeof props === 'object') {
			if ('action' in props) {
				if (!resourceContext)
					return

				const resource = (
					props.resource ? resolveResource(resourceContext, { name: props.resource }) : undefined
				) ?? getResource()

				if (resource == null)
					return

				switch (props.action) {
					case ResourceActionType.List:
					case ResourceActionType.Create: {
						const path = createResourcePath({
							resolved: resource,
							action: props.action,
							params: props.params,
						})

						return go({
							to: path,
						})
					}
					case ResourceActionType.Edit:
					case ResourceActionType.Show: {
						const path = createResourcePath({
							resolved: resource,
							action: props.action,
							params: {
								id: props.id,
								...props.params,
							},
						})

						return go({
							to: path,
						})
					}
				}
			}
			else {
				return go(props)
			}
		}
	}
}
