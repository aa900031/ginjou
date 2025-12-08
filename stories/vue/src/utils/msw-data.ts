import type { Collection } from '@msw/data'
import { faker } from '@faker-js/faker'
import { http, HttpResponse } from 'msw'
import { resolveURL } from 'ufo'

export function toHandlers(
	collection: Collection<any>,
	collectionName: string,
	baseUrl: string,
): any {
	const listUrl = resolveURL(baseUrl, collectionName)
	const itemUrl = `${listUrl}/:id`

	return [
		// GET /resource - List all records with filtering, sorting, and pagination
		http.get(listUrl, async (info) => {
			try {
				const url = new URL(info.request.url)

				// Build query with filters
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
								filterParams[field] = (val: any) => Number(val) >= Number(value)
								break
							case 'lte':
								filterParams[field] = (val: any) => Number(val) <= Number(value)
								break
							case 'like':
								filterParams[field] = (val: any) => String(val).includes(value)
								break
							default:
								filterParams[field] = value
						}
					}
				})

				// Query records
				let allRecords: any[]
				if (Object.keys(filterParams).length > 0) {
					allRecords = collection.findMany((q: any) => q.where(filterParams))
				}
				else {
					allRecords = collection.findMany()
				}

				// Handle sorting
				const sort = url.searchParams.get('_sort')
				const order = url.searchParams.get('_order')
				let records = allRecords
				if (sort && order) {
					const sorts = sort.split(',')
					const orders = order.split(',')
					records = allRecords.sort((a: any, b: any) => {
						for (let i = 0; i < sorts.length; i++) {
							const sortKey = sorts[i]
							const sortOrder = orders[i]
							const aVal = a[sortKey]
							const bVal = b[sortKey]

							let comparison = 0
							if (aVal < bVal)
								comparison = -1
							else if (aVal > bVal)
								comparison = 1

							if (comparison !== 0) {
								return sortOrder === 'DESC' ? -comparison : comparison
							}
						}
						return 0
					})
				}

				// Handle pagination
				const start = url.searchParams.get('_start')
				const end = url.searchParams.get('_end')
				const total = records.length
				if (start && end) {
					const startNum = Number(start)
					const endNum = Number(end)
					records = records.slice(startNum, endNum)
				}

				return HttpResponse.json(records, {
					headers: {
						'x-total-count': `${total}`,
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
		http.get(itemUrl, async (info) => {
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
		http.post(listUrl, async (info) => {
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
		http.put(itemUrl, async (info) => {
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
		http.patch(itemUrl, async (info) => {
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
		http.delete(itemUrl, async (info) => {
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
