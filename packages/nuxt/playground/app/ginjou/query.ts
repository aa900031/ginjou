import { defineQueryClientContext } from '@ginjou/vue'
import { QueryClient } from '@tanstack/vue-query'

// eslint-disable-next-line ts/explicit-function-return-type
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
