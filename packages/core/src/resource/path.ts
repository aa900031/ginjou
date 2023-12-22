import { inject as injectRegexparam } from 'regexparam'
import type { ResourceActionTypeValues } from './action'
import type { ResourceDefinition } from './definition'

export interface CreateResourcePathProps {
	resource: ResourceDefinition
	action: ResourceActionTypeValues
	params?: Record<string, any>
}

export function createResourcePath(
	props: CreateResourcePathProps,
): string | undefined {
	const { resource, action, params } = props
	const target = resource[action]
	if (!target)
		return

	const pattern = typeof target === 'string' ? target : target.pattern
	const result = injectRegexparam(pattern, params ?? {})
	return result
}
