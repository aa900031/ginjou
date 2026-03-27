import { createError, getRouterParam } from 'h3'
import { getOrderById, getOrderStore } from '../../../utils/orders'

export default defineEventHandler((event) => {
	const id = Number(getRouterParam(event, 'id'))
	const order = getOrderById(getOrderStore(), id)

	if (!order) {
		throw createError({ statusCode: 404, statusMessage: `Order ${id} not found` })
	}

	return order
})
