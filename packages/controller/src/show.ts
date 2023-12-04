import type { BaseRecord, GetOneResult } from '@ginjou/query'

export interface GetShowRecordProps<
	TResultData extends BaseRecord,
> {
	result: GetOneResult<TResultData> | undefined
}

export function getShowRecord<
	TResultData extends BaseRecord,
>(
	props: GetShowRecordProps<TResultData>,
): TResultData | undefined {
	return props.result?.data
}

export interface HandleShowErrorProps<
	TError = unknown,
> {
	error: TError
}

export function handleShowError<
	TError = unknown,
>(
	props: HandleShowErrorProps<TError>,
): void {
	console.error(props.error)
}
