import { defineAuthzContext } from '@ginjou/vue'

// eslint-disable-next-line ts/explicit-function-return-type
export default () => defineAuthzContext({
	getPermissions: async () => {
		return ['admin']
	},
})
