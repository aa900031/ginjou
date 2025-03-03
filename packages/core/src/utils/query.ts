import { getter } from './getter'

export type EnabledGetter = (() => boolean | undefined) | boolean

export function resolveEnabled(
	enabled: EnabledGetter | undefined,
	condition: boolean | (() => boolean),
): boolean {
	const _enabled = getter(enabled)
	if (_enabled == null)
		return getter(condition)

	return _enabled && getter(condition)
}
