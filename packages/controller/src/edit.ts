import type { BaseRecord, UpdateMutationProps, UpdateResult } from '@ginjou/query'
import { type SaveFunction, mergeSaveOptions } from './save'

export interface CreateSaveEditFnProps<
	TParams extends Record<string, any> = any,
	TOptions extends Record<string, any> = any, // TODO: use correct type
> {
	mutate: (
		props: UpdateMutationProps<TParams>,
		options: TOptions,
	) => Promise<any> // TODO: refactor to Tanstack mutate types
	getProps: (
		values: TParams,
	) => UpdateMutationProps<TParams>
	getOptions: () => TOptions
}

export type SaveEditFn<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> = SaveFunction<TParams, UpdateResult<TData>, TError, UpdateMutationProps<TParams>>

export function createSaveEditFn<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	props: CreateSaveEditFnProps<TParams>,
): SaveEditFn<TData, TError, TParams> {
	return async (
		values,
		options,
	) => {
		try {
			const optionsFromProp = props.getOptions()
			await props.mutate(
				props.getProps(values),
				mergeSaveOptions(options, optionsFromProp),
			)
		}
		catch (error) {
			// TODO: process errors, then return
		}
	}
}
