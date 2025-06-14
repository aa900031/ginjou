import { defineAuthzContext } from '@ginjou/vue'

export default () => defineAuthzContext({
	getPermissions: async () => {
		return ['admin']
	},
})
