import { createError, getRouterParam, readBody } from 'h3'
import { getOrderStore, updateOrder } from '../../../utils/orders'

export default defineEventHandler(async (event) => {
	const id = Number(getRouterParam(event, 'id'))

	if (Number.isNaN(id)) {
		throw createError({ statusCode: 400, statusMessage: 'Invalid order id' })
	}

	const body = await readBody(event)

	return updateOrder(getOrderStore(), id, {
		status: body?.status,
		channel: body?.channel,
		notes: body?.notes,
	})
})
