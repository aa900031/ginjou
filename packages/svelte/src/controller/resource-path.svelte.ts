import type { ResourceAction } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { MaybeAccessor } from '../utils'
import type { UseResourceContext } from './resource.svelte'
import { ResourcePath } from '@ginjou/core'
import { extract } from '../utils'
import { useResource } from './resource.svelte'

export type UseResourcePathProps = MaybeAccessor<{
	action: ResourceAction.TypeValues
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
	const controller = useResource(() => ({
		name: resolvedProps.resource,
	}), context)

	const value = $derived.by(() => ResourcePath.get({
		resolved: controller.value,
		action: resolvedProps.action,
		params: resolvedProps.params,
	}))

	return {
		get value() {
			return value
		},
	}
}
