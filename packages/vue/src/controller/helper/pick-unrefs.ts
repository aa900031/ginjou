import { includeKeys } from 'filter-obj'
import { unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import type { UnwrapRecordMaybeRef } from './types'

export function pickUnrefs<
	TTarget extends Record<string | number | symbol, MaybeRef<any>>,
	TKeys extends keyof TTarget,
>(
	target: TTarget,
	fields: readonly TKeys[],
): Pick<UnwrapRecordMaybeRef<TTarget>, TKeys> {
	const picked = includeKeys(target, fields)

	return Object.keys(picked).reduce((obj, key, value) => {
		obj[key] = unref(value)
		return obj
	}, {} as any)
}
