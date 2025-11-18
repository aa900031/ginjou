import type { Fetcher, GetOneFn } from './fetcher'
import type { Fetchers } from './fetchers'
import { describe, expect, it } from 'vitest'
import { getFetcher, getFetcherFn, getSafeFetcherFn, resolveFetcherProps } from './fetchers'

describe('resolveFetcherProps', () => {
	it('should return default fetcherName if not provided', () => {
		const props = {}
		const resolved = resolveFetcherProps(props)
		expect(resolved).toEqual({ fetcherName: 'default' })
	})

	it('should return the provided fetcherName', () => {
		const props = { fetcherName: 'myFetcher' }
		const resolved = resolveFetcherProps(props)
		expect(resolved).toEqual({ fetcherName: 'myFetcher' })
	})
})

describe('getFetcher', () => {
	const mockFetcher = {
		getOne: async () => ({ data: { id: '1', name: 'foo' } }),
	} satisfies Fetcher
	const mockFetchers = {
		default: mockFetcher,
		another: {
			getOne: async () => ({ data: { id: '1', name: 'bar' } }),
		},
	} satisfies Fetchers

	it('should return the correct fetcher for a given name', () => {
		const props = { fetcherName: 'default' }
		const resolvedProps = resolveFetcherProps(props)
		const fetcher = getFetcher(resolvedProps, mockFetchers)
		expect(fetcher).toBe(mockFetcher)
	})

	it('should throw error if fetchers are not provided', () => {
		const props = { fetcherName: 'default' }
		const resolvedProps = resolveFetcherProps(props)
		expect(() => getFetcher(resolvedProps, undefined)).toThrow('Data Provider not exists!')
	})

	it('should throw error if fetcherName does not exist', () => {
		const props = { fetcherName: 'nonExistent' }
		const resolvedProps = resolveFetcherProps(props)
		expect(() => getFetcher(resolvedProps, mockFetchers)).toThrow('Data Provider (nonExistent) not exists!')
	})
})

describe('getFetcherFn', () => {
	const mockGetOneFn: GetOneFn = async () => ({ data: { id: '1', name: 'foo' } })
	const mockFetchers = {
		default: {
			getOne: mockGetOneFn,
		},
	} satisfies Fetchers

	it('should return the correct fetcher function', () => {
		const resolvedProps = resolveFetcherProps({})
		const queryFn = getFetcherFn(resolvedProps, mockFetchers, 'getOne')
		expect(queryFn).toBe(mockGetOneFn)
	})

	it('should throw error if fetcher function does not exist', () => {
		const resolvedProps = resolveFetcherProps({})
		expect(() => getFetcherFn(resolvedProps, mockFetchers, 'getList')).toThrow('Fetcher function: getList not exists')
	})
})

describe('getSafeFetcherFn', () => {
	const mockGetOneFn: GetOneFn = async () => ({ data: { id: '1', name: 'foo' } })
	const mockFetchers = {
		default: {
			getOne: mockGetOneFn,
		},
	} satisfies Fetchers

	it('should return the correct fetcher function if it exists and is a function', () => {
		const resolvedProps = resolveFetcherProps({})
		const queryFn = getSafeFetcherFn(resolvedProps, mockFetchers, 'getOne')
		expect(queryFn).toBe(mockGetOneFn)
	})

	it('should return undefined if fetcher function does not exist', () => {
		const resolvedProps = resolveFetcherProps({})
		const nonExistentFn = getSafeFetcherFn(resolvedProps, mockFetchers, 'getList')
		expect(nonExistentFn).toBeUndefined()
	})
})
