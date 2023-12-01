import type { BaseRecord, Pagination } from '@ginjou/query'

export interface GetListHasNextPageProps {
	total: number | undefined
	pagination: Pagination
}

export function getListHasNextPage(
	props: GetListHasNextPageProps,
): boolean | undefined {
	return props.total != null
		? props.pagination.current * props.pagination.perPage < props.total
		: undefined
}

export interface GetListHasPreviousPageProps {
	total: number | undefined
	pagination: Pagination
}

export function getListHasPreviousPage(
	props: GetListHasPreviousPageProps,
): boolean | undefined {
	return props.total != null
		? props.pagination.current > 1
		: undefined
}

export interface GetCorrectListPageProps<
	TResultData extends BaseRecord,
> {
	isFetching: boolean
	pagination: Pagination
	data: TResultData[] | undefined
	total: number | undefined
}

export function getListCorrectPage<
	TResultData extends BaseRecord,
>(
	props: GetCorrectListPageProps<TResultData>,
): number | undefined {
	if (
		props.pagination.current <= 0
		|| (
			!props.isFetching
			&& props.pagination.current > 1
			&& (
				props.data == null
				|| props.data.length === 0
			)
		)
	)
		return 1

	if (props.total != null) {
		const pages = Math.ceil(props.total / props.pagination.perPage) || 1
		if (
			!props.isFetching
			&& props.pagination.current > pages
		)
			return pages
	}
}
