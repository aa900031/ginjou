import type { Import } from '../utils/import'

const composables = [
	'useQuery',
	'useQueries',
	'useInfiniteQuery',
	'useMutation',
	'useIsFetching',
	'useIsMutating',
	'useQueryClient',
]

export default composables.map(
	name => ({
		name,
		from: '@tanstack/vue-query',
	}),
) satisfies Import[]
