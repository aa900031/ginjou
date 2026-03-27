import { describe, expect, it } from 'vitest'
import type { Order } from '../app/types/orders'
import {
	getOrderMetrics,
	getOrderById,
	queryOrders,
	updateOrder,
} from '../server/utils/orders'

const sampleOrders: Order[] = [
	{
		id: 1,
		number: 'ORD-1001',
		customerName: 'Ada Lovelace',
		customerEmail: 'ada@example.com',
		status: 'paid',
		total: 249,
		itemCount: 3,
		channel: 'web',
		createdAt: '2026-03-25T10:00:00.000Z',
		updatedAt: '2026-03-25T10:00:00.000Z',
	},
	{
		id: 2,
		number: 'ORD-1002',
		customerName: 'Grace Hopper',
		customerEmail: 'grace@example.com',
		status: 'pending',
		total: 99,
		itemCount: 1,
		channel: 'marketplace',
		createdAt: '2026-03-26T09:30:00.000Z',
		updatedAt: '2026-03-26T09:30:00.000Z',
	},
	{
		id: 3,
		number: 'ORD-1003',
		customerName: 'Linus Torvalds',
		customerEmail: 'linus@example.com',
		status: 'refunded',
		total: 149,
		itemCount: 2,
		channel: 'web',
		createdAt: '2026-03-27T08:00:00.000Z',
		updatedAt: '2026-03-27T08:00:00.000Z',
	},
	{
		id: 4,
		number: 'ORD-1004',
		customerName: 'Margaret Hamilton',
		customerEmail: 'margaret@example.com',
		status: 'paid',
		total: 320,
		itemCount: 4,
		channel: 'pos',
		createdAt: '2026-03-27T12:00:00.000Z',
		updatedAt: '2026-03-27T12:00:00.000Z',
	},
]

describe('orders domain', () => {
	it('filters, sorts, and paginates orders for list views', () => {
		const result = queryOrders(sampleOrders, {
			_start: 0,
			_end: 2,
			_sort: 'total',
			_order: 'desc',
			q: 'ma',
		})

		expect(result.total).toBe(2)
		expect(result.data.map(order => order.number)).toEqual([
			'ORD-1004',
			'ORD-1002',
		])
	})

	it('builds dashboard metrics from the current order set', () => {
		const metrics = getOrderMetrics(sampleOrders)

		expect(metrics.revenue).toBe(817)
		expect(metrics.averageOrderValue).toBeCloseTo(204.25)
		expect(metrics.statusTotals).toEqual({
			paid: 2,
			pending: 1,
			refunded: 1,
		})
		expect(metrics.recentOrderIds).toEqual([4, 3, 2])
	})

	it('finds and updates a single order for edit views', () => {
		const before = getOrderById(sampleOrders, 2)

		expect(before?.status).toBe('pending')

		const updated = updateOrder(sampleOrders, 2, {
			status: 'paid',
			channel: 'web',
			notes: 'Paid after manual review',
		})

		expect(updated).toMatchObject({
			id: 2,
			status: 'paid',
			channel: 'web',
			notes: 'Paid after manual review',
		})
		expect(updated.updatedAt).not.toBe('2026-03-26T09:30:00.000Z')
	})
})
