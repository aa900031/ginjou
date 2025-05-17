import type { Import } from '../utils/import'

const composables = [
	// Query
	{
		from: './runtime/composables/get-one',
		name: 'useAsyncGetOne',
	},
	{
		from: './runtime/composables/get-many',
		name: 'useAsyncGetMany',
	},
	{
		from: './runtime/composables/get-list',
		name: 'useAsyncGetList',
	},
	{
		from: './runtime/composables/get-infinite-list',
		name: 'useAsyncGetInfiniteList',
	},
	// Controllers
	{
		from: './runtime/composables/show',
		name: 'useAsyncShow',
	},
	{
		from: './runtime/composables/list',
		name: 'useAsyncList',
	},
	{
		from: './runtime/composables/form',
		name: 'useAsyncForm',
	},
	{
		from: './runtime/composables/select',
		name: 'useAsyncSelect',
	},
	{
		from: './runtime/composables/infinite-list',
		name: 'useAsyncInfiniteList',
	},
] as const

export default function (
	resolve: (...path: string[]) => string,
) {
	return composables.map(
		item => ({
			from: resolve(item.from),
			name: item.name,
		}),
	) satisfies Import[]
}
