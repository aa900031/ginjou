import type { addImports } from '@nuxt/kit'

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
) satisfies (Parameters<typeof addImports> extends [infer T] ? T : never)[]
