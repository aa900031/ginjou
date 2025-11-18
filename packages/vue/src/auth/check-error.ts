import type { CheckAuthErrorResult } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { UseQueryClientContextProps } from '../query'
import type { UseGoContext } from '../router'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseAuthContextFromProps } from './auth'
import type { UseLogoutContext } from './logout'
import { CheckError } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useQueryClientContext } from '../query'
import { useGo } from '../router'
import { useAuthContext } from './auth'
import { useLogout } from './logout'

export type UseCheckErrorProps<
	TParams,
	TError,
> = ToMaybeRefs<
	& CheckError.Props<TParams, TError>
>

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
	CheckAuthErrorResult<TParams>,
	TError,
	TParams,
	unknown
>

export function useCheckError<
	TParams = unknown,
	TError = unknown,
>(
	props?: UseCheckErrorProps<TParams, TError>,
	context?: UseCheckErrorContext,
): UseCheckErrorResult<TParams, TError> {
	const auth = useAuthContext(context)
	const queryClient = useQueryClientContext(context)
	const go = useGo(context)
	const { mutateAsync: logout } = useLogout(undefined, context)

	return useMutation<CheckAuthErrorResult<TParams>, TError, TParams>(computed(() => ({
		...unref(props?.mutationOptions),
		mutationKey: CheckError.createMutationKey(),
		mutationFn: CheckError.createMutationFn({
			auth,
		}),
		onSuccess: CheckError.createSuccessHandler({
			logout,
			go,
			onSuccess: unref(props?.mutationOptions)?.onSuccess,
		}),
	})), queryClient)
}
