import { getQuery, setHeader } from 'h3'
import { getOrderStore, queryOrders } from '../../utils/orders'

export default defineEventHandler((event) => {
	const result = queryOrders(getOrderStore(), getQuery(event))

	setHeader(event, 'x-total-count', String(result.total))

	return result.data
})
