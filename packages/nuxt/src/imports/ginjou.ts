import type { Import } from '../utils/import'

const composables = [
	'useAccessContext',
	'useAuthContext',
	'useAuthenticated',
	'useBack',
	'useCheckError',
	'useCreate',
	'useCreateMany',
	'useCustom',
	'useCustomMutation',
	'useDelete',
	'useDeleteMany',
	'useFetchersContext',
	'useForm',
	'useGetIdentity',
	'useGetInfiniteList',
	'useGetList',
	'useGetMany',
	'useGetOne',
	'useGo',
	'useI18nContext',
	'useList',
	'useLocale',
	'useLocation',
	'useLogin',
	'useLogout',
	'useNavigateTo',
	'useNotificationContext',
	'useNotify',
	'usePermissions',
	'usePublish',
	'useQueryClientContext',
	'useRealtimeContext',
	'useRealtimeOptions',
	'useResolvePath',
	'useResource',
	'useResourceContext',
	'useResourcePath',
	'useRouterContext',
	'useSelect',
	'useShow',
	'useSubscribe',
	'useTranslate',
	'useUpdate',
	'useUpdateMany',
]

export default composables.map(
	name => ({
		name,
		from: '@ginjou/vue',
	}),
) satisfies Import[]
