import type { Simplify } from 'type-fest'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import { useMutation } from '@tanstack/vue-query'
import type { AuthCheckErrorResult } from '@ginjou/core'
import { CheckError } from '@ginjou/core'
import { useGo } from '../router'
import type { UseGoContext } from '../router'
import type { UseAuthContextFromProps } from './auth'
import { useAuthContext } from './auth'
import type { UseLogoutContext } from './logout'
import { useLogout } from './logout'

export type UseCheckErrorContext = Simplify<
	& UseAuthContextFromProps
	& UseLogoutContext
	& UseGoContext
>

export type UseCheckErrorResult<
	TParams,
	TError,
> = UseMutationReturnType<
	AuthCheckErrorResult,
	TError,
	TParams,
	unknown
>

export function useCheckError<
	TParams = unknown,
	TError = unknown,
>(
	context?: UseCheckErrorContext,
): UseCheckErrorResult<TParams, TError> {
	const auth = useAuthContext({ ...context, strict: true })
	const go = useGo(context)
	const { mutateAsync: logout } = useLogout(context)

	return useMutation<AuthCheckErrorResult, TError, TParams>({
		mutationKey: CheckError.createMutationKey(),
		mutationFn: CheckError.createMutationFn<TParams, TError>({
			auth,
		}),
		onSuccess: CheckError.createSuccessHandler<TParams, TError>({
			logout,
			go,
		}),
	})
}
