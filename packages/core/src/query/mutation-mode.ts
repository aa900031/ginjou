import type { SetRequired, ValueOf } from 'type-fest'
import type { BaseRecord, GetListResult, GetManyResult, GetOneResult, RecordKey } from './fetcher'
import type { UpdaterFn } from './types'

export const MutationMode = {
	Pessimistic: 'pessimistic',
	Optimistic: 'optimistic',
	Undoable: 'undoable',
} as const

export type MutationModeValues = ValueOf<typeof MutationMode>

export interface MutationModeProps {
	mutationMode?: MutationModeValues
	undoableTimeout?: number
}

export type ResolvedMutationModeProps = SetRequired<
	MutationModeProps,
	| 'mutationMode'
	| 'undoableTimeout'
>

export function resolveMutationModeProps(
	props: MutationModeProps,
): ResolvedMutationModeProps {
	return {
		mutationMode: props.mutationMode ?? MutationMode.Pessimistic,
		undoableTimeout: props.undoableTimeout ?? 5000,
	}
}

export function createModifyListItemUpdaterFn<
	TData extends BaseRecord,
	TParams,
>(
	idOrIds: RecordKey | RecordKey[],
	params: TParams,
): UpdaterFn<GetListResult<TData>> {
	// TODO: optimisticUpdateMap

	if (Array.isArray(idOrIds)) {
		return function modifyListUpdater(previous) {
			if (!previous)
				return

			const ids = idOrIds
				.filter(id => id != null)
				.map(String)

			const data = previous.data?.map((record: TData) => {
				if (record.id != null && ids.includes(record.id.toString())) {
					return {
						...record,
						...params,
					} as unknown as TData
				}
				return record
			}) ?? []

			return {
				...previous,
				data,
			}
		}
	}

	return function modifyListUpdater(previous) {
		if (!previous)
			return

		const id = idOrIds.toString()

		const data = previous.data?.map((record: TData) => {
			if (record.id?.toString() === id) {
				return {
					id: idOrIds,
					...record,
					...params,
				} as unknown as TData
			}
			return record
		}) ?? []

		return {
			...previous,
			data,
		}
	}
}

export function createModifyManyUpdaterFn<
	TData extends BaseRecord,
	TParams,
>(
	idOrIds: RecordKey | RecordKey[],
	params: TParams,
): UpdaterFn<GetManyResult<TData>> {
	// TODO: optimisticUpdateMap

	if (Array.isArray(idOrIds)) {
		return function modifyManyUpdater(previous) {
			if (!previous)
				return

			const ids = idOrIds
				.filter(id => id != null)
				.map(String)
			const data = previous.data?.map((record: TData) => {
				if (record.id != null && ids.includes(record.id.toString())) {
					return {
						...record,
						...params,
					} as unknown as TData
				}
				return record
			}) ?? []

			return {
				...previous,
				data,
			}
		}
	}

	return function modifyManyUpdater(previous) {
		if (!previous)
			return

		const id = idOrIds.toString()
		const data = previous.data?.map((record: TData) => {
			if (record.id?.toString() === id) {
				return {
					id: idOrIds,
					...record,
					...params,
				} as unknown as TData
			}
			return record
		}) ?? []

		return {
			...previous,
			data,
		}
	}
}

export function createModifyOneUpdaterFn<
	TData extends BaseRecord,
	TParams,
>(
	params: TParams,
): UpdaterFn<GetOneResult<TData>> {
	// TODO: optimisticUpdateMap

	return function modifyOneUpdater(previous) {
		if (!previous)
			return

		return {
			...previous,
			data: {
				...previous.data,
				...params,
			},
		}
	}
}

export function createRemoveListItemUpdaterFn<
	TData extends BaseRecord,
>(
	idOrIds: RecordKey | RecordKey[],
): UpdaterFn<GetListResult<TData>> {
	// TODO: optimisticUpdateMap

	if (Array.isArray(idOrIds)) {
		return function removeListItemUpdater(previous) {
			if (!previous)
				return

			const ids = idOrIds
				.filter(id => id != null)
				.map(String)
			const data = previous.data?.filter(
				item =>
					(item.id != null) && !ids.includes(item.id.toString()),
			) ?? []

			return {
				...previous,
				data,
				total: previous.total - ids.length,
			}
		}
	}

	return function removeListItemUpdater(previous) {
		if (!previous)
			return

		const id = idOrIds.toString()
		const data = previous.data?.filter(
			record => record.id?.toString() !== id,
		) ?? []

		return {
			data,
			total: previous.total - 1,
		}
	}
}

export function createRemoveManyUpdaterFn<
	TData extends BaseRecord,
>(
	idOrIds: RecordKey | RecordKey[],
): UpdaterFn<GetManyResult<TData>> {
	// TODO: optimisticUpdateMap

	if (Array.isArray(idOrIds)) {
		return function removeManyUpdater(previous) {
			if (!previous)
				return

			const ids = idOrIds
				.filter(id => id != null)
				.map(String)
			const data = previous.data?.filter(
				item =>
					(item.id != null) && !ids.includes(item.id.toString()),
			) ?? []

			return {
				...previous,
				data,
			}
		}
	}

	return function removeManyUpdater(previous) {
		if (!previous)
			return

		const id = idOrIds.toString()
		const data = previous.data?.filter(
			record => record.id?.toString() !== id,
		) ?? []

		return {
			...previous,
			data,
		}
	}
}
