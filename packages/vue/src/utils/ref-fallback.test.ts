import { describe, expect, it, vi } from 'vitest'
import { ref, unref } from 'vue-demi'
import { refFallback } from './ref-fallback'

describe('refFallback', () => {
	describe('basic functionality', () => {
		it('should create a reactive ref from params and get function', () => {
			const params = ref({ value: 10 })
			const get = vi.fn((p: { value: number }) => p.value * 2)

			const result = refFallback(() => unref(params), get)

			expect(unref(result)).toBe(20)
			expect(get).toHaveBeenCalledWith({ value: 10 }, undefined)
		})

		it('should execute get function immediately with flush: sync', () => {
			const get = vi.fn((p: number) => p + 1)
			const params = ref(5)

			const result = refFallback(() => unref(params), get)

			expect(get).toHaveBeenCalledTimes(1)
			expect(unref(result)).toBe(6)
		})

		it('should return a ShallowRef', () => {
			const get = vi.fn((p: string) => p.toUpperCase())

			const result = refFallback(() => 'hello', get)

			expect(unref(result)).toBe('HELLO')
		})
	})

	describe('reactivity', () => {
		it('should update when params change', () => {
			const params = ref(10)
			const get = vi.fn((p: number) => p * 3)

			const result = refFallback(() => unref(params), get)

			expect(unref(result)).toBe(30)
			expect(get).toHaveBeenCalledTimes(1)

			params.value = 20

			expect(unref(result)).toBe(60)
			expect(get).toHaveBeenCalledTimes(2)
		})

		it('should update when nested params change', () => {
			const params = ref({ a: 5, b: 10 })
			const get = vi.fn((p: { a: number; b: number }) => p.a + p.b)

			const result = refFallback(() => unref(params), get)

			expect(unref(result)).toBe(15)

			params.value = { a: 8, b: 12 }

			expect(unref(result)).toBe(20)
			expect(get).toHaveBeenCalledTimes(2)
		})

		it('should handle multiple reactive dependencies', () => {
			const param1 = ref(5)
			const param2 = ref(10)
			const get = vi.fn((p: { x: number; y: number }) => p.x * p.y)

			const result = refFallback(
				() => ({ x: unref(param1), y: unref(param2) }),
				get,
			)

			expect(unref(result)).toBe(50)

			param1.value = 7
			expect(unref(result)).toBe(70)

			param2.value = 3
			expect(unref(result)).toBe(21)
		})
	})

	describe('old value parameter', () => {
		it('should pass previous value as second parameter to get function', () => {
			const params = ref(1)
			const get = vi.fn((p: number, old?: number) => {
				return old !== undefined ? old + p : p
			})

			const result = refFallback(() => unref(params), get)

			expect(unref(result)).toBe(1)
			expect(get).toHaveBeenCalledWith(1, undefined)

			params.value = 2
			expect(unref(result)).toBe(3) // 1 + 2
			expect(get).toHaveBeenCalledWith(2, 1)

			params.value = 5
			expect(unref(result)).toBe(8) // 3 + 5
			expect(get).toHaveBeenCalledWith(5, 3)
		})

		it('should pass undefined as old value on first call', () => {
			const get = vi.fn((p: string, old?: string) => {
				return old ? `${old}-${p}` : p
			})

			const result = refFallback(() => 'first', get)

			expect(get).toHaveBeenCalledWith('first', undefined)
			expect(unref(result)).toBe('first')
		})

		it('should allow get function to use old value for state accumulation', () => {
			const counter = ref(1)
			const get = vi.fn((p: number, old?: number[]) => {
				const prev = old ?? []
				return [...prev, p]
			})

			const result = refFallback(() => unref(counter), get)

			expect(unref(result)).toEqual([1])

			counter.value = 2
			expect(unref(result)).toEqual([1, 2])

			counter.value = 3
			expect(unref(result)).toEqual([1, 2, 3])

			expect(get).toHaveBeenCalledTimes(3)
		})

		it('should handle complex old value types', () => {
			const params = ref({ action: 'add', value: 5 })
			interface State {
				total: number
				history: string[]
			}
			const get = vi.fn((p: { action: string; value: number }, old?: State): State => {
				const prevTotal = old?.total ?? 0
				const prevHistory = old?.history ?? []
				return {
					total: prevTotal + p.value,
					history: [...prevHistory, `${p.action}:${p.value}`],
				}
			})

			const result = refFallback(() => unref(params), get)

			expect(unref(result)).toEqual({
				total: 5,
				history: ['add:5'],
			})

			params.value = { action: 'add', value: 10 }
			expect(unref(result)).toEqual({
				total: 15,
				history: ['add:5', 'add:10'],
			})
		})
	})

	describe('edge cases', () => {
		it('should handle undefined params', () => {
			const params = ref<number | undefined>(undefined)
			const get = vi.fn((p: number | undefined) => p ?? 0)

			const result = refFallback(() => unref(params), get)

			expect(unref(result)).toBe(0)

			params.value = 42
			expect(unref(result)).toBe(42)
		})

		it('should handle null values', () => {
			const params = ref<number | null>(null)
			const get = vi.fn((p: number | null) => p === null ? -1 : p)

			const result = refFallback(() => unref(params), get)

			expect(unref(result)).toBe(-1)

			params.value = 100
			expect(unref(result)).toBe(100)
		})

		it('should handle empty objects', () => {
			const params = ref({})
			const get = vi.fn((p: object) => Object.keys(p).length)

			const result = refFallback(() => unref(params), get)

			expect(unref(result)).toBe(0)
		})

		it('should handle array params', () => {
			const params = ref([1, 2, 3])
			const get = vi.fn((p: number[]) => p.reduce((a, b) => a + b, 0))

			const result = refFallback(() => unref(params), get)

			expect(unref(result)).toBe(6)

			params.value = [4, 5]
			expect(unref(result)).toBe(9)
		})

		it('should handle function params', () => {
			const params = ref((x: number) => x * 2)
			const get = vi.fn((p: (x: number) => number) => p(5))

			const result = refFallback(() => unref(params), get)

			expect(unref(result)).toBe(10)

			params.value = (x: number) => x + 10
			expect(unref(result)).toBe(15)
		})

		it('should not update if params return same reference', () => {
			const staticObj = { value: 42 }
			const get = vi.fn((p: { value: number }) => p.value)

			const result = refFallback(() => staticObj, get)

			expect(unref(result)).toBe(42)
			expect(get).toHaveBeenCalledTimes(1)

			// Since params always returns same reference, watch won't trigger
			// This is expected behavior with flush: 'sync'
		})

		it('should handle errors in get function', () => {
			const params = ref(10)
			const get = vi.fn((p: number) => {
				if (p > 5) throw new Error('Value too large')
				return p
			})

			expect(() => {
				refFallback(() => unref(params), get)
			}).toThrow('Value too large')
		})

		it('should handle zero values', () => {
			const params = ref(0)
			const get = vi.fn((p: number) => p || -1)

			const result = refFallback(() => unref(params), get)

			expect(unref(result)).toBe(-1)

			params.value = 5
			expect(unref(result)).toBe(5)
		})

		it('should handle boolean values', () => {
			const params = ref(false)
			const get = vi.fn((p: boolean, old?: string) => {
				return p ? 'true' : (old ?? 'false')
			})

			const result = refFallback(() => unref(params), get)

			expect(unref(result)).toBe('false')

			params.value = true
			expect(unref(result)).toBe('true')
		})
	})

	describe('synchronous behavior', () => {
		it('should update synchronously with flush: sync', () => {
			const params = ref(1)
			const get = vi.fn((p: number) => p * 10)

			const result = refFallback(() => unref(params), get)

			let capturedValue = unref(result)
			expect(capturedValue).toBe(10)

			params.value = 5
			// Should be updated immediately due to flush: 'sync'
			capturedValue = unref(result)
			expect(capturedValue).toBe(50)
		})

		it('should call get immediately on creation', () => {
			const get = vi.fn((p: number) => p)

			refFallback(() => 42, get)

			expect(get).toHaveBeenCalledTimes(1)
			expect(get).toHaveBeenCalledWith(42, undefined)
		})
	})

	describe('type safety', () => {
		it('should handle typed params and return values', () => {
			interface Config {
				enabled: boolean
				count: number
			}

			const params = ref<Config>({ enabled: true, count: 5 })
			const get = (p: Config): string => {
				return p.enabled ? `Count: ${p.count}` : 'Disabled'
			}

			const result = refFallback(() => unref(params), get)

			expect(unref(result)).toBe('Count: 5')

			params.value = { enabled: false, count: 10 }
			expect(unref(result)).toBe('Disabled')
		})

		it('should handle union types', () => {
			const params = ref<string | number>('hello')
			const get = (p: string | number): string => {
				return typeof p === 'string' ? p.toUpperCase() : p.toString()
			}

			const result = refFallback(() => unref(params), get)

			expect(unref(result)).toBe('HELLO')

			params.value = 42
			expect(unref(result)).toBe('42')
		})
	})

	describe('performance', () => {
		it('should not cause unnecessary recalculations', () => {
			const params = ref({ a: 1, b: 2 })
			const get = vi.fn((p: { a: number; b: number }) => p.a + p.b)

			const result = refFallback(() => unref(params), get)

			expect(get).toHaveBeenCalledTimes(1)

			// Accessing the value shouldn't trigger recalculation
			unref(result)
			unref(result)
			unref(result)

			expect(get).toHaveBeenCalledTimes(1)
		})

		it('should handle rapid updates efficiently', () => {
			const params = ref(0)
			const get = vi.fn((p: number) => p + 1)

			const result = refFallback(() => unref(params), get)

			for (let i = 1; i <= 100; i++) {
				params.value = i
			}

			expect(get).toHaveBeenCalledTimes(101) // Initial + 100 updates
			expect(unref(result)).toBe(101)
		})
	})

	describe('real-world scenarios', () => {
		it('should work with location and sync route params', () => {
			interface Location {
				query: Record<string, string>
			}
			const location = ref<Location>({ query: { page: '1' } })
			const syncRoute = ref(true)

			const get = (params: { location: Location; syncRoute: boolean }) => {
				if (!params.syncRoute) return undefined
				return Number.parseInt(params.location.query.page) || undefined
			}

			const result = refFallback(
				() => ({ location: unref(location), syncRoute: unref(syncRoute) }),
				get,
			)

			expect(unref(result)).toBe(1)

			location.value = { query: { page: '5' } }
			expect(unref(result)).toBe(5)

			syncRoute.value = false
			expect(unref(result)).toBeUndefined()
		})

		it('should work with fallback chains', () => {
			const locationValue = ref<number | undefined>(undefined)
			const propValue = ref<number | undefined>(undefined)
			const initialValue = ref<number>(1)

			const get = (params: {
				location?: number
				prop?: number
				initial: number
			}) => {
				return params.location ?? params.prop ?? params.initial
			}

			const result = refFallback(
				() => ({
					location: unref(locationValue),
					prop: unref(propValue),
					initial: unref(initialValue),
				}),
				get,
			)

			expect(unref(result)).toBe(1)

			propValue.value = 5
			expect(unref(result)).toBe(5)

			locationValue.value = 10
			expect(unref(result)).toBe(10)

			locationValue.value = undefined
			expect(unref(result)).toBe(5)
		})

		it('should work with filters and sorters', () => {
			type Filters = Array<{ field: string; value: any }>

			const locationFilters = ref<Filters | undefined>(undefined)
			const propFilters = ref<Filters | undefined>([{ field: 'status', value: 'active' }])

			const get = (params: { location?: Filters; prop?: Filters }, old?: Filters) => {
				return params.location ?? params.prop ?? old ?? []
			}

			const result = refFallback(
				() => ({ location: unref(locationFilters), prop: unref(propFilters) }),
				get,
			)

			expect(unref(result)).toEqual([{ field: 'status', value: 'active' }])

			locationFilters.value = [{ field: 'id', value: 1 }]
			expect(unref(result)).toEqual([{ field: 'id', value: 1 }])
		})
	})
})