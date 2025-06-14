import type { InfiniteData } from '@tanstack/query-core'
import type { BaseRecord, RecordKey } from './fetcher'

export async function fakeMany<
	TData,
>(
	promises: Promise<{ data: TData }>[],
) {
	return {
		data: (await Promise.all(promises)).map(res => res.data),
	}
}

export function isInfiniteData(
	data: unknown,
): data is InfiniteData<unknown> {
	return data != null
		&& typeof data === 'object'
		&& 'pages' in data
		&& 'pageParams' in data
		&& Array.isArray(data.pages)
		&& Array.isArray(data.pageParams)
}

export function checkTargetRecord<
	T extends BaseRecord,
>(
	data: T,
	ids: RecordKey[],
): boolean {
	return (data.id != null)
		&& !ids.includes(data.id.toString())
}

export function mergeTargetRecord<
	T extends BaseRecord,
>(
	data: T,
	ids: RecordKey[],
	params: any,
): T {
	if (data.id != null && ids.includes(data.id.toString())) {
		return {
			...data,
			...params,
		} as unknown as T
	}
	return data
}
