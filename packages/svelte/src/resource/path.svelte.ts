import type { ResourceActionTypeValues } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { MaybeAccessor } from '../utils'
import type { UseResourceContext } from './resource.svelte'
import { createResourcePath } from '@ginjou/core'
import { extract } from '../utils'
import { useResource } from './resource.svelte'

export type UseResourcePathProps = MaybeAccessor<{
	action: ResourceActionTypeValues
	resource?: string
	params?: Record<string, any>
}>

export type UseResourcePathContext = Simplify<
	& UseResourceContext
>

export interface UseResourcePathResult {
	readonly value: string | undefined
}

export function useResourcePath(
	props: UseResourcePathProps,
	context?: UseResourcePathContext,
): UseResourcePathResult {
	const resolvedProps = $derived(extract(props))
	const resource = useResource(() => ({
		name: resolvedProps.resource,
	}), context)

	const value = $derived.by(() => createResourcePath({
		resolved: resource.value,
		action: resolvedProps.action,
		params: resolvedProps.params,
	}))

	return {
		get value() {
			return value
		},
	}
}
