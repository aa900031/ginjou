export type OrderStatus = 'paid' | 'pending' | 'refunded'
export type OrderChannel = 'web' | 'marketplace' | 'pos'

export interface Order {
	id: number
	number: string
	customerName: string
	customerEmail: string
	status: OrderStatus
	total: number
	itemCount: number
	channel: OrderChannel
	createdAt: string
	updatedAt: string
	notes?: string
}
