import type { Resolved } from './resource'
import type * as ResourceAction from './resource-action'
import { inject as injectRegexparam } from 'regexparam'

export interface GetParams {
	action: ResourceAction.TypeValues
	resolved: Resolved | undefined
	params?: Record<string, any>
}

export function get(
	{
		action,
		resolved,
		params,
	}: GetParams,
): string | undefined {
	const target = resolved?.resource[action]
	if (!target)
		return

	const pattern = typeof target === 'string' ? target : target.pattern
	return injectRegexparam(pattern, {
		...{ id: 'id' in resolved ? resolved.id : undefined },
		...{ action: resolved.action },
		...params,
	})
}
