import { defineFetchersContext } from '@ginjou/vue'
import { createFetcher } from '@ginjou/with-rest-api'

// eslint-disable-next-line ts/explicit-function-return-type
export default () => defineFetchersContext({
	default: createFetcher({
		url: '/api',
		client: $fetch as any,
	}),
})
