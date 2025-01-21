import { describe, expect, it, vi } from 'vitest'
import { createSetFiltersFn, createSetSortersFn, SetFilterBehavior } from './list'

describe('list', () => {
	describe('createSetFiltersFn', () => {
		it('should return a function', () => {
			const getFiltersPermanent = vi.fn()
			const getFiltersBehavior = vi.fn()
			const getPrev = vi.fn()
			const update = vi.fn()

			const setFilters = createSetFiltersFn({
				getFiltersPermanent,
				getFiltersBehavior,
				getPrev,
				update,
			})

			expect(setFilters).toBeTypeOf('function')
		})

		it('should call update with the new value', () => {
			const getFiltersPermanent = vi.fn(() => [{ field: 'gender', operator: 'eq', value: 'male' }] as any)
			const getFiltersBehavior = vi.fn(() => undefined)
			const getPrev = vi.fn(() => [{ field: 'age', operator: 'gt', value: '10' }] as any)
			const update = vi.fn()

			const setFilters = createSetFiltersFn({
				getFiltersPermanent,
				getFiltersBehavior,
				getPrev,
				update,
			})

			setFilters([
				{ field: 'name', operator: 'eq', value: 'John' },
			])

			expect(update).toHaveBeenCalledOnce()

			expect(update).toHaveBeenCalledWith([
				{ field: 'gender', operator: 'eq', value: 'male' },
				{ field: 'name', operator: 'eq', value: 'John' },
				{ field: 'age', operator: 'gt', value: '10' },
			])
		})

		it('should not call update when value are the same', () => {
			const getFiltersPermanent = vi.fn(() => undefined)
			const getFiltersBehavior = vi.fn(() => undefined)
			const getPrev = vi.fn(() => [{ field: 'age', operator: 'gt', value: '10' }] as any)
			const update = vi.fn()

			const setFilters = createSetFiltersFn({
				getFiltersPermanent,
				getFiltersBehavior,
				getPrev,
				update,
			})

			setFilters([
				{ field: 'age', operator: 'gt', value: '10' },
			])

			expect(update).not.toBeCalled()
		})

		it('should fallow behavior from getFiltersBehavior', () => {
			const getFiltersPermanent = vi.fn(() => [{ field: 'gender', operator: 'eq', value: 'male' }] as any)
			const getFiltersBehavior = vi.fn(() => SetFilterBehavior.Replace)
			const getPrev = vi.fn(() => [{ field: 'age', operator: 'gt', value: '10' }] as any)
			const update = vi.fn()

			const setFilters = createSetFiltersFn({
				getFiltersPermanent,
				getFiltersBehavior,
				getPrev,
				update,
			})

			setFilters([
				{ field: 'name', operator: 'eq', value: 'John' },
			])

			expect(getFiltersBehavior).toHaveBeenCalledOnce()
			expect(update).toHaveBeenCalledOnce()

			expect(update).toHaveBeenCalledWith([
				{ field: 'gender', operator: 'eq', value: 'male' },
				{ field: 'name', operator: 'eq', value: 'John' },
			])
		})

		it('should fallow behavior from function params', () => {
			const getFiltersPermanent = vi.fn(() => [{ field: 'gender', operator: 'eq', value: 'male' }] as any)
			const getFiltersBehavior = vi.fn(() => undefined)
			const getPrev = vi.fn(() => [{ field: 'age', operator: 'gt', value: '10' }] as any)
			const update = vi.fn()

			const setFilters = createSetFiltersFn({
				getFiltersPermanent,
				getFiltersBehavior,
				getPrev,
				update,
			})

			setFilters([
				{ field: 'name', operator: 'eq', value: 'John' },
			], SetFilterBehavior.Replace)

			expect(getFiltersBehavior).not.toHaveBeenCalledOnce()
			expect(update).toHaveBeenCalledOnce()

			expect(update).toHaveBeenCalledWith([
				{ field: 'gender', operator: 'eq', value: 'male' },
				{ field: 'name', operator: 'eq', value: 'John' },
			])
		})
	})

	describe('createSetSortersFn', () => {
		it('should return a function', () => {
			const getSortersPermanent = vi.fn()
			const getPrev = vi.fn()
			const update = vi.fn()

			const setSorters = createSetSortersFn({
				getSortersPermanent,
				getPrev,
				update,
			})

			expect(setSorters).toBeTypeOf('function')
		})

		it('should call update with the new value', () => {
			const getSortersPermanent = vi.fn(() => [{ field: 'name', order: 'asc' }] as any)
			const getPrev = vi.fn(() => [{ field: 'age', order: 'desc' }] as any)
			const update = vi.fn()

			const setSorters = createSetSortersFn({
				getSortersPermanent,
				getPrev,
				update,
			})

			setSorters([
				{ field: 'gender', order: 'asc' },
			])

			expect(update).toHaveBeenCalledOnce()

			expect(update).toHaveBeenCalledWith([
				{ field: 'name', order: 'asc' },
				{ field: 'gender', order: 'asc' },
			])
		})

		it('should not call update when value are the same', () => {
			const getSortersPermanent = vi.fn(() => undefined)
			const getPrev = vi.fn(() => [{ field: 'age', order: 'desc' }] as any)
			const update = vi.fn()

			const setSorters = createSetSortersFn({
				getSortersPermanent,
				getPrev,
				update,
			})

			setSorters([
				{ field: 'age', order: 'desc' },
			])

			expect(update).not.toBeCalled()
		})
	})
})
