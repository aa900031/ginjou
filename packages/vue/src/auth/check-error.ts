import type { AuthCheckErrorResult } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { UseQueryClientContextProps } from '../query'
import type { UseGoContext } from '../router'
import type { UseAuthContextFromProps } from './auth'
import type { UseLogoutContext } from './logout'
import { CheckError } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { useQueryClientContext } from '../query'
import { useGo } from '../router'
import { useAuthContext } from './auth'
import { useLogout } from './logout'

export type UseCheckErrorContext = Simplify<
	& UseAuthContextFromProps
	& UseLogoutContext
	& UseGoContext
	& UseQueryClientContextProps
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
	const auth = useAuthContext(context)
	const queryClient = useQueryClientContext(context)
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
	}, queryClient)
}
