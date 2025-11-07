import type { ResourceActionTypeValues } from './action'
import type { ResolvedResource } from './resolve'
import { inject as injectRegexparam } from 'regexparam'

export interface CreateResourcePathProps {
	action: ResourceActionTypeValues
	resolved: ResolvedResource | undefined
	params?: Record<string, any>
}

export function createResourcePath(
	{
		action,
		resolved,
		params,
	}: CreateResourcePathProps,
): string | undefined {
	const target = resolved?.resource[action]
	if (!target)
		return

	const pattern = typeof target === 'string' ? target : target.pattern
	const result = injectRegexparam(pattern, {
		...{ id: 'id' in resolved ? resolved.id : undefined },
		...{ action: resolved.action },
		...params,
	})
	return result
}
