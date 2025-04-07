import { defineQueryClientContext } from '@ginjou/vue'
import { QueryClient } from '@tanstack/vue-query'

export default () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 5 * 60 * 1000,
			},
		},
	})

	defineQueryClientContext(queryClient)
}
