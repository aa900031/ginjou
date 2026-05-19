import type { InfiniteData } from '@tanstack/query-core'
import type { BaseRecord, GetListResult, GetManyResult, GetOneResult, Params, RecordKey } from './fetcher'
import type { UpdaterFn } from './types'
import { checkTargetRecord, isInfiniteData, mergeTargetRecord } from './helper'

export type OptimisticUpdateMapValue<
	TPrevious,
	TParams,
	TTarget,
>
	= | boolean
		| OptimisticUpdateMapFunction<TPrevious, TParams, TTarget>

export type OptimisticUpdateMapFunction<
	TPrevious,
	TParams,
	TTarget,
> = (previous: TPrevious | undefined, params: TParams, target: TTarget) => TPrevious | undefined

export type ActiveOptimisticUpdateMapValue<
	TPrevious,
	TParams,
	TTarget,
> = Exclude<OptimisticUpdateMapValue<TPrevious, TParams, TTarget>, false>

export interface OptimisticUpdateMap<
	TData extends BaseRecord,
	TParams,
	TTarget extends RecordKey | RecordKey[],
	TPageParam = unknown,
> {
	list?: OptimisticUpdateMapValue<
		GetListResult<TData, TPageParam> | InfiniteData<GetListResult<TData, TPageParam>>,
		TParams,
		TTarget
	>
	many?: OptimisticUpdateMapValue<
		GetManyResult<TData>,
		TParams,
		TTarget
	>
	one?: OptimisticUpdateMapValue<
		GetOneResult<TData>,
		TParams,
		RecordKey
	>
}

export interface OptimisticUpdateMapProps<
	TData extends BaseRecord,
	TParams,
	TTarget extends RecordKey | RecordKey[],
	TPageParam = unknown,
> {
	optimisticUpdateMap?: OptimisticUpdateMap<TData, TParams, TTarget, TPageParam>
}

export function shouldApplyOptimisticUpdate<
	TPrevious,
	TParams,
	TTarget,
>(
	optimisticUpdate: OptimisticUpdateMapValue<TPrevious, TParams, TTarget> | undefined,
): optimisticUpdate is ActiveOptimisticUpdateMapValue<TPrevious, TParams, TTarget> | undefined {
	return optimisticUpdate !== false
}

export function createOptimisticUpdateMapUpdaterFn<
	TPrevious,
	TParams,
	TTarget,
>(
	optimisticUpdateMapFunction: OptimisticUpdateMapFunction<TPrevious, TParams, TTarget>,
	params: TParams,
	target: TTarget,
): UpdaterFn<TPrevious> {
	return previous => optimisticUpdateMapFunction(previous, params, target)
}

export function createModifyListItemUpdaterFn<
	TData extends BaseRecord,
	TParams extends Params,
	TPageParam,
	TTarget extends RecordKey | RecordKey[] = RecordKey | RecordKey[],
>(
	idOrIds: TTarget,
	params: TParams,
): UpdaterFn<GetListResult<TData, TPageParam> | InfiniteData<GetListResult<TData, TPageParam>>> {
	const ids = normalizeIds(idOrIds)

	return modifyListUpdater

	function modifyListUpdater(
		previous: GetListResult<TData, TPageParam> | InfiniteData<GetListResult<TData, TPageParam>> | undefined,
	): GetListResult<TData, TPageParam> | InfiniteData<GetListResult<TData, TPageParam>> | undefined {
		if (!previous)
			return

		if (isInfiniteData(previous)) {
			const pages = previous.pages.map(page => ({
				...page,
				data: page.data?.map(record =>
					mergeTargetRecord(record, ids, params),
				) ?? [],
			}))

			return {
				...previous,
				pages,
			}
		}
		else {
			const data = previous.data?.map(record =>
				mergeTargetRecord(record, ids, params),
			) ?? []

			return {
				...previous,
				data,
			}
		}
	}
}

export function createModifyManyUpdaterFn<
	TData extends BaseRecord,
	TParams,
	TTarget extends RecordKey | RecordKey[] = RecordKey | RecordKey[],
>(
	idOrIds: TTarget,
	params: TParams,
): UpdaterFn<GetManyResult<TData>> {
	const ids = normalizeIds(idOrIds)

	return modifyManyUpdater

	function modifyManyUpdater(
		previous: GetManyResult<TData> | undefined,
	): GetManyResult<TData> | undefined {
		if (!previous)
			return

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

export function createModifyOneUpdaterFn<
	TData extends BaseRecord,
	TParams,
>(
	params: TParams,
): UpdaterFn<GetOneResult<TData>> {
	return modifyOneUpdater

	function modifyOneUpdater(
		previous: GetOneResult<TData> | undefined,
	): GetOneResult<TData> | undefined {
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
	TPageParam,
	TTarget extends RecordKey | RecordKey[] = RecordKey | RecordKey[],
>(
	idOrIds: TTarget,
): UpdaterFn<GetListResult<TData, TPageParam> | InfiniteData<GetListResult<TData, TPageParam>>> {
	const ids = normalizeIds(idOrIds)

	return removeListItemUpdater

	function removeListItemUpdater(
		previous: GetListResult<TData, TPageParam> | InfiniteData<GetListResult<TData, TPageParam>> | undefined,
	): GetListResult<TData, TPageParam> | InfiniteData<GetListResult<TData, TPageParam>> | undefined {
		if (!previous)
			return

		if (isInfiniteData(previous)) {
			const pages = previous.pages.map(page => ({
				...page,
				data: page.data?.filter(item =>
					checkTargetRecord(item, ids),
				) ?? [],
				total: page.total - ids.length,
			}))
			return {
				...previous,
				pages,
			}
		}
		else {
			const data = previous.data?.filter(item =>
				checkTargetRecord(item, ids),
			) ?? []
			return {
				...previous,
				data,
				total: previous.total - ids.length,
			}
		}
	}
}

export function createRemoveManyUpdaterFn<
	TData extends BaseRecord,
	TTarget extends RecordKey | RecordKey[] = RecordKey | RecordKey[],
>(
	idOrIds: TTarget,
): UpdaterFn<GetManyResult<TData>> {
	const ids = normalizeIds(idOrIds)

	return removeManyUpdater

	function removeManyUpdater(
		previous: GetManyResult<TData> | undefined,
	): GetManyResult<TData> | undefined {
		if (!previous)
			return

		const data = previous.data?.filter(
			record => (record.id != null) && !ids.includes(record.id.toString()),
		) ?? []

		return {
			...previous,
			data,
		}
	}
}

function normalizeIds(
	idOrIds: RecordKey | RecordKey[],
): string[] {
	return (Array.isArray(idOrIds) ? idOrIds : [idOrIds])
		.filter(id => id != null)
		.map(String)
}
