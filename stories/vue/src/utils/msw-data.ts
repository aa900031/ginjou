import type { Collection } from '@msw/data'
import type { HttpHandler } from 'msw'
import { faker } from '@faker-js/faker'
import { http, HttpResponse } from 'msw'
import { resolveURL } from 'ufo'

export function toHandlers(
	collection: Collection<any>,
	collectionName: string,
	baseUrl: string,
): HttpHandler[] {
	const listPath = resolveURL(baseUrl, collectionName)
	const itemPath = `${listPath}/:id`

	return [
		// GET /resource - List all records with filtering, sorting, and pagination
		http.get(listPath, async (info) => {
			try {
				const url = new URL(info.request.url)
				const filterParams: Record<string, any> = {}
				url.searchParams.forEach((value, key) => {
					if (!['_start', '_end', '_sort', '_order'].includes(key)) {
						const keys = key.split('_')
						const operator = keys.length >= 2 ? keys.pop() : undefined
						const field = keys.join('_')

						switch (operator) {
							case 'ne':
								filterParams[field] = (val: any) => val !== value
								break
							case 'gte':
								filterParams[field] = (val: any) => {
									const numVal = Number(val)
									const numThreshold = Number(value)
									return !Number.isNaN(numVal) && !Number.isNaN(numThreshold) && numVal >= numThreshold
								}
								break
							case 'lte':
								filterParams[field] = (val: any) => {
									const numVal = Number(val)
									const numThreshold = Number(value)
									return !Number.isNaN(numVal) && !Number.isNaN(numThreshold) && numVal <= numThreshold
								}
								break
							case 'like':
								filterParams[field] = (val: any) => String(val).includes(value)
								break
							default:
								filterParams[field] = value
						}
					}
				})

				const orderBy: Record<string, any> = {}
				const sort = url.searchParams.get('_sort')
				const order = url.searchParams.get('_order')
				if (sort && order) {
					const sorts = sort.split(',')
					const orders = order.split(',')
					for (let i = 0; i < sorts.length; i++) {
						const key = sorts[i]
						const order = orders[i]
						orderBy[key] = order
					}
				}

				const start = url.searchParams.get('_start')
				const end = url.searchParams.get('_end')
				let take: number | undefined
				let skip: number | undefined
				if (start && end) {
					const startNum = Number(start)
					const endNum = Number(end)
					skip = startNum
					take = endNum - startNum
				}

				const records = collection.findMany(
					Object.keys(filterParams).length > 0
						? (q: any) => q.where(filterParams)
						: undefined,
					{
						take,
						skip,
						orderBy,
					},
				)
				const all = collection.findMany(
					Object.keys(filterParams).length > 0
						? (q: any) => q.where(filterParams)
						: undefined,
				)

				return HttpResponse.json(records, {
					headers: {
						'x-total-count': `${all.length}`,
					},
				})
			}
			catch (error: any) {
				return HttpResponse.json(
					{ message: error.message || 'Failed to fetch records' },
					{ status: 500 },
				)
			}
		}),

		// GET /resource/:id - Get a single record
		http.get(itemPath, async (info) => {
			try {
				const id = info.params.id
				const record = collection.findFirst((q: any) => q.where({ id }))

				if (!record) {
					return HttpResponse.json(
						{ message: 'Not found' },
						{ status: 404 },
					)
				}

				return HttpResponse.json(record)
			}
			catch (error: any) {
				return HttpResponse.json(
					{ message: error.message || 'Failed to fetch record' },
					{ status: 500 },
				)
			}
		}),

		// POST /resource - Create a new record
		http.post(listPath, async (info) => {
			try {
				const body = await info.request.json()
				const record = await collection.create({
					...(body as any),
					id: faker.string.uuid(),
				})
				return HttpResponse.json(record, { status: 201 })
			}
			catch (error: any) {
				return HttpResponse.json(
					{ message: error.message || 'Failed to create record' },
					{ status: 400 },
				)
			}
		}),

		// PUT /resource/:id - Update a record
		http.put(itemPath, async (info) => {
			try {
				const id = info.params.id
				const body = await info.request.json()

				const updated = await collection.update(
					(q: any) => q.where({ id }),
					{
						data(record: any) {
							Object.assign(record, body)
						},
					},
				)

				return HttpResponse.json(updated)
			}
			catch (error: any) {
				return HttpResponse.json(
					{ message: error.message || 'Failed to update record' },
					{ status: 400 },
				)
			}
		}),

		// PATCH /resource/:id - Partial update
		http.patch(itemPath, async (info) => {
			try {
				const id = info.params.id
				const body = await info.request.json()

				const updated = await collection.update(
					(q: any) => q.where({ id }),
					{
						data(record: any) {
							Object.assign(record, body)
						},
					},
				)

				return HttpResponse.json(updated)
			}
			catch (error: any) {
				return HttpResponse.json(
					{ message: error.message || 'Failed to update record' },
					{ status: 400 },
				)
			}
		}),

		// DELETE /resource/:id - Delete a record
		http.delete(itemPath, async (info) => {
			try {
				const id = info.params.id
				const deleted = collection.delete((q: any) => q.where({ id }))

				return HttpResponse.json(deleted)
			}
			catch (error: any) {
				return HttpResponse.json(
					{ message: error.message || 'Failed to delete record' },
					{ status: 400 },
				)
			}
		}),
	]
}
