import type * as Resource from './resource'
import type * as SyncRoute from './sync-route'
import type * as WarnUnsaved from './warn-unsaved'

export interface Controller<
	TResourceMeta extends Record<string, any> = Record<string, any>,
> {
	resources?: Resource.Raw<TResourceMeta>[]
	syncRoute?: SyncRoute.Prop
	warnUnsaved?: WarnUnsaved.Prop
}

/* @__NO_SIDE_EFFECTS__ */
export function defineController<
	T extends Controller,
>(
	value: T,
): T {
	return value
}
