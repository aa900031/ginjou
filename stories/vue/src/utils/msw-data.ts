import { resolveURL } from 'ufo'
import { HttpResponse, http } from 'msw'
import type { Entity, FactoryAPI, ModelAPI, ModelDictionary } from '@mswjs/data/lib/glossary'
import { withErrors } from '@mswjs/data/lib/model/generateRestHandlers'

export function toHandlers<
	Dictionary extends ModelDictionary,
	ModelName extends keyof Dictionary,
>(
	factory: FactoryAPI<Dictionary>,
	modelName: ModelName,
	baseUrl: string,
): any {
	const model = factory[modelName] as ModelAPI<Dictionary, ModelName>
	return [
		http.get(
			resolveURL(baseUrl, modelName.toString()),
			withErrors<Entity<Dictionary, ModelName>>(async (info) => {
				const url = new URL(info.request.url)

				const options: Parameters<ModelAPI<Dictionary, ModelName>['findMany']>[0] = {}

				const start = url.searchParams.get('_start')
				const end = url.searchParams.get('_end')
				if (start && end) {
					options.skip = +start
					options.take = +end - +start
					url.searchParams.delete('_start')
					url.searchParams.delete('_end')
				}
				const sort = url.searchParams.get('_sort')
				const order = url.searchParams.get('_order')
				if (sort && order) {
					const sorts = sort.split(',')
					const orders = order.split(',')
					options.orderBy = sorts.map((sort, index) => ({
						[sort]: orders[index],
					} as any))
					url.searchParams.delete('_sort')
					url.searchParams.delete('_order')
				}

				url.searchParams.forEach((value, key) => {
					options.where ??= {}
					const keys = key.split('_')
					const operator = keys.length >= 2 ? keys.pop() : undefined
					const field = keys.join('_')

					switch (operator) {
						case 'ne':
							(options.where as any)[field] = {
								notEquals: value,
							}
							break
						case 'gte':
							(options.where as any)[field] = {
								gte: value,
							}
							break
						case 'lte':
							(options.where as any)[field] = {
								lte: value,
							}
							break
						case 'like':
							(options.where as any)[field] = {
								contains: value,
							}
							break
						default:
							(options.where as any)[field] = {
								equals: value,
							}
					}
				})

				const records = model.findMany(options)

				const options2: Parameters<ModelAPI<Dictionary, ModelName>['count']>[0] = { ...options } as any
				delete (options2 as any).skip
				delete (options2 as any).take
				const totals = model.count(options2)

				return HttpResponse.json(records, {
					headers: {
						'x-total-count': `${totals}`,
					},
				})
			}),
		),
	]
}
