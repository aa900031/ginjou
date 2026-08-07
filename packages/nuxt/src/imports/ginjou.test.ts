import { describe, expect, it } from 'vitest'
import createAsyncImports from './async'
import ginjouImports from './ginjou'

const ginjouComposableNames = [
	'useAuthContext',
	'useAuthzContext',
	'useAuthenticated',
	'useCanAccess',
	'useCheckError',
	'useCreateOne',
	'useCreateMany',
	'useCustom',
	'useCustomMutation',
	'useDeleteOne',
	'useDeleteMany',
	'useFetchersContext',
	'useClone',
	'useCreate',
	'useEdit',
	'useGetIdentity',
	'useGetInfiniteList',
	'useGetList',
	'useGetMany',
	'useGetManyByOne',
	'useGetOne',
	'useInfiniteList',
	'useList',
	'useLogin',
	'useLogout',
	'useNavigateTo',
	'useNotificationContext',
	'useNotify',
	'usePermissions',
	'usePublish',
	'useQueryClientContext',
	'useRealtimeContext',
	'useResource',
	'useControllerContext',
	'useResourcePath',
	'useSelect',
	'useShow',
	'useSubscribe',
	'useUpdateOne',
	'useUpdateMany',
	'useWarnUnsaved',
] as const

const asyncComposableNames = [
	'useAsyncGetOne',
	'useAsyncGetMany',
	'useAsyncGetList',
	'useAsyncGetInfiniteList',
	'useAsyncClone',
	'useAsyncShow',
	'useAsyncList',
	'useAsyncEdit',
	'useAsyncSelect',
	'useAsyncInfiniteList',
	'useAsyncAuthenticated',
	'useAsyncGetIdentity',
	'useAsyncPermissions',
	'useAsyncCanAccess',
] as const

describe('nuxt imports', () => {
	it('should expose the selected Vue composables as auto imports', () => {
		expect(ginjouImports.map(item => item.name)).toEqual(ginjouComposableNames)
		expect(ginjouImports.every(item => item.from === '@ginjou/vue')).toBe(true)
		expect(new Set(ginjouImports.map(item => item.name)).size).toBe(ginjouImports.length)
	})

	it('should expose the supported async composables as auto imports', () => {
		const imports = createAsyncImports((...path) => path.join('/'))

		expect(imports.map(item => item.name)).toEqual(asyncComposableNames)
		expect(imports.every(item => item.from.startsWith('./runtime/composables/'))).toBe(true)
		expect(new Set(imports.map(item => item.name)).size).toBe(imports.length)
	})
})
