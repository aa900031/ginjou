import type { RecordKey } from '../query'
import type { ResourceActionTypeValues } from '../resource'
import type { Navigate } from '../router'
import { ResourceActionType } from '../resource'

export type RedirectOptions<
	TData,
>
	= | Navigate.ToProps
		| ResourceActionTypeValues
		| (
			(data: TData) =>
				| Navigate.ToProps
				| ResourceActionTypeValues
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
) {
	const params = typeof redirect === 'function'
		? redirect(data)
		: redirect

	switch (params) {
		case ResourceActionType.List:
		case ResourceActionType.Create:
			return navigateTo({
				resource,
				action: params,
			})
		case ResourceActionType.Edit:
		case ResourceActionType.Show:
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
