import type { ResourceAction } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { MaybeAccessor, ReadonlyBox } from '../utils'
import type { UseResourceContext } from './resource.svelte'
import { ResourcePath } from '@ginjou/core'
import { extract, unbox } from '../utils'
import { useResource } from './resource.svelte'

export type UseResourcePathProps = MaybeAccessor<{
	action: ResourceAction.TypeValues
	resource?: string
	params?: Record<string, any>
}>

export type UseResourcePathContext = Simplify<
	& UseResourceContext
>

export type UseResourcePathResult = ReadonlyBox<string | undefined>

export function useResourcePath(
	props: UseResourcePathProps,
	context?: UseResourcePathContext,
): UseResourcePathResult {
	const resolvedProps = $derived(extract(props))
	const controller = useResource(() => ({
		name: resolvedProps.resource,
	}), context)

	const value = $derived.by(() => ResourcePath.get({
		resolved: unbox(controller),
		action: resolvedProps.action,
		params: resolvedProps.params,
	}))

	return {
		get value() {
			return value
		},
	}
}
