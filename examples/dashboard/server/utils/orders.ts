import type { Order, OrderChannel, OrderStatus } from '../../app/types/orders'

export interface OrderQuery {
	_start?: number | string
	_end?: number | string
	_sort?: keyof Order | string
	_order?: 'asc' | 'desc' | string
	q?: string
	status?: OrderStatus
}

export interface OrderMetrics {
	revenue: number
	averageOrderValue: number
	statusTotals: Record<OrderStatus, number>
	recentOrderIds: number[]
}

const seedNames = [
	['Ada Lovelace', 'ada@analytical.engine'],
	['Grace Hopper', 'grace@compiler.dev'],
	['Linus Torvalds', 'linus@kernel.dev'],
	['Margaret Hamilton', 'margaret@apollo.dev'],
	['Donald Knuth', 'donald@stanford.dev'],
	['Radia Perlman', 'radia@routing.dev'],
	['Barbara Liskov', 'barbara@types.dev'],
	['Tim Berners-Lee', 'tim@web.dev'],
]
const seedStatuses: OrderStatus[] = ['paid', 'pending', 'refunded']
const seedChannels: OrderChannel[] = ['web', 'marketplace', 'pos']

let orderStore: Order[] | undefined

const textFields: Array<keyof Order> = ['number', 'customerName', 'customerEmail', 'channel', 'status', 'notes']

function toNumber(value: number | string | undefined, fallback: number): number {
	if (typeof value === 'number') {
		return value
	}

	if (typeof value === 'string' && value.length > 0) {
		const parsed = Number(value)

		if (Number.isFinite(parsed)) {
			return parsed
		}
	}

	return fallback
}

function matchesQuery(order: Order, query: string): boolean {
	const search = query.trim().toLowerCase()

	if (!search) {
		return true
	}

	return textFields.some((field) => {
		const value = order[field]

		return typeof value === 'string' && value.toLowerCase().includes(search)
	})
}

function compareValues(left: Order, right: Order, sortField: keyof Order, order: 'asc' | 'desc'): number {
	const leftValue = left[sortField]
	const rightValue = right[sortField]
	const direction = order === 'asc' ? 1 : -1

	if (leftValue === rightValue) {
		return 0
	}

	if (leftValue == null) {
		return 1 * direction
	}

	if (rightValue == null) {
		return -1 * direction
	}

	if (typeof leftValue === 'number' && typeof rightValue === 'number') {
		return (leftValue - rightValue) * direction
	}

	return String(leftValue).localeCompare(String(rightValue)) * direction
}

export function queryOrders(orders: Order[], query: OrderQuery = {}): { data: Order[], total: number } {
	const sortField = ((query._sort as keyof Order | undefined) ?? 'createdAt')
	const sortOrder = query._order === 'asc' ? 'asc' : 'desc'
	const start = toNumber(query._start, 0)
	const end = toNumber(query._end, orders.length)

	const filtered = orders
		.filter(order => !query.status || order.status === query.status)
		.filter(order => matchesQuery(order, query.q ?? ''))
		.toSorted((left, right) => compareValues(left, right, sortField, sortOrder))

	return {
		data: filtered.slice(start, end),
		total: filtered.length,
	}
}

export function getOrderMetrics(orders: Order[]): OrderMetrics {
	const revenue = orders.reduce((sum, order) => sum + order.total, 0)
	const recentOrderIds = [...orders]
		.toSorted((left, right) => compareValues(left, right, 'createdAt', 'desc'))
		.slice(0, 3)
		.map(order => order.id)

	return {
		revenue,
		averageOrderValue: orders.length > 0 ? revenue / orders.length : 0,
		statusTotals: {
			paid: orders.filter(order => order.status === 'paid').length,
			pending: orders.filter(order => order.status === 'pending').length,
			refunded: orders.filter(order => order.status === 'refunded').length,
		},
		recentOrderIds,
	}
}

export function getOrderById(orders: Order[], id: number): Order | undefined {
	return orders.find(order => order.id === id)
}

export function updateOrder(
	orders: Order[],
	id: number,
	patch: Partial<Pick<Order, 'status' | 'channel' | 'notes'>>,
): Order {
	const order = getOrderById(orders, id)

	if (!order) {
		throw new Error(`Order ${id} not found`)
	}

	Object.assign(order, patch, {
		updatedAt: new Date().toISOString(),
	})

	return order
}

export function createSeedOrders(count = 24): Order[] {
	const now = Date.parse('2026-03-27T18:00:00.000Z')

	return Array.from({ length: count }, (_, index) => {
		const seed = seedNames[index % seedNames.length] as [string, string]
		const [customerName, customerEmail] = seed
		const id = index + 1
		const status = seedStatuses[index % seedStatuses.length]!
		const channel = seedChannels[index % seedChannels.length]!
		const createdAt = new Date(now - index * 1000 * 60 * 60 * 6).toISOString()
		const updatedAt = new Date(now - index * 1000 * 60 * 45).toISOString()
		const total = 80 + ((index * 37) % 280)
		const itemCount = (index % 4) + 1

		return {
			id,
			number: `ORD-${1000 + id}`,
			customerName,
			customerEmail,
			status,
			total,
			itemCount,
			channel,
			createdAt,
			updatedAt,
			notes: index % 5 === 0 ? 'Priority fulfillment' : undefined,
		}
	})
}

export function getOrderStore(): Order[] {
	if (!orderStore) {
		orderStore = createSeedOrders()
	}

	return orderStore
}
