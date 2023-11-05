import type { BaseRecord, CreateMutationProps, CreateResult } from '@ginjou/query'
import type { SaveFunction } from './save'
import { mergeSaveOptions } from './save'

export interface CreateSaveCreateFnProps<
	TParams extends Record<string, any> = any,
	TOptions extends Record<string, any> = any, // TODO: use correct type
> {
	mutate: (
		props: CreateMutationProps<TParams>,
		options: TOptions,
	) => Promise<any>
	getProps: (
		values: TParams,
	) => CreateMutationProps<TParams>
	getOptions: () => TOptions
}

export type SaveCreateFn<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> = SaveFunction<TParams, CreateResult<TData>, TError, CreateMutationProps<TParams>>

export function createSaveCreateFn<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	props: CreateSaveCreateFnProps<TParams>,
): SaveCreateFn<TData, TError, TParams> {
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

		}
	}
}
