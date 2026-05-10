import type { RecordKey } from '../query'
import type { Navigate } from '../router'
import * as ResourceAction from './resource-action'

export type RedirectOptions<
	TData,
>
	= | Navigate.ToProps
		| ResourceAction.TypeValues
		| (
			(data: TData) =>
				| Navigate.ToProps
				| ResourceAction.TypeValues
		)

export interface RedirectToProps<
	TData,
> {
	redirect: RedirectOptions<TData>
	resource: string | undefined
	id: RecordKey | undefined
	data: TData
	navigateTo: Navigate.ToFn
}

export function redirectTo<
	TData,
>(
	{
		redirect,
		resource,
		id,
		data,
		navigateTo,
	}: RedirectToProps<TData>,
): void {
	const params = typeof redirect === 'function'
		? redirect(data)
		: redirect

	switch (params) {
		case ResourceAction.Type.List:
		case ResourceAction.Type.Create:
			return navigateTo({
				resource,
				action: params,
			})
		case ResourceAction.Type.Edit:
		case ResourceAction.Type.Show:
			if (id == null)
				return
			return navigateTo({
				resource,
				action: params,
				id,
			})
		default:
			return navigateTo(params)
	}
}
