export interface CreateListHasNextPageProps {
	total: number | undefined
	page: number
	perPage: number
}

export function createListHasNextPage(
	props: CreateListHasNextPageProps,
): boolean | undefined {
	return props.total != null
		? props.page * props.perPage < props.total
		: undefined
}

export interface CreateListHasPreviousPageProps {
	total: number | undefined
	page: number
}

export function createListHasPreviousPage(
	props: CreateListHasPreviousPageProps,
): boolean | undefined {
	return props.total != null
		? props.page > 1
		: undefined
}
