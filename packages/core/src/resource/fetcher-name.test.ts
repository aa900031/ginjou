import type { GetFetcherNameProps } from './fetcher-name'
import type { ResolvedResource } from './resolve'
import { describe, expect, it } from 'vitest'
import { getFetcherName } from './fetcher-name'

describe('getFetcherName', () => {
	it('should return fetcherNameFromProp if provided', () => {
		const props: GetFetcherNameProps = {
			resource: {
				resource: {
					meta: {
						fetcherName: 'resourceFetcher',
					},
				},
			} as ResolvedResource,
			fetcherNameFromProp: 'propFetcher',
		}
		expect(getFetcherName(props)).toBe('propFetcher')
	})

	it('should return resource.resource.meta.fetcherName if fetcherNameFromProp is not provided', () => {
		const props: GetFetcherNameProps = {
			resource: {
				resource: {
					meta: {
						fetcherName: 'resourceFetcher',
					},
				},
			} as ResolvedResource,
			fetcherNameFromProp: undefined,
		}
		expect(getFetcherName(props)).toBe('resourceFetcher')
	})

	it('should return undefined if neither fetcherNameFromProp nor resource.resource.meta.fetcherName is provided', () => {
		const props: GetFetcherNameProps = {
			resource: {
				resource: {
					meta: {},
				},
			} as ResolvedResource,
			fetcherNameFromProp: undefined,
		}
		expect(getFetcherName(props)).toBeUndefined()
	})

	it('should return undefined if resource is undefined and fetcherNameFromProp is not provided', () => {
		const props: GetFetcherNameProps = {
			resource: undefined,
			fetcherNameFromProp: undefined,
		}
		expect(getFetcherName(props)).toBeUndefined()
	})

	it('should return undefined if resource.resource.meta is undefined and fetcherNameFromProp is not provided', () => {
		const props: GetFetcherNameProps = {
			resource: {
				resource: {},
			} as ResolvedResource,
			fetcherNameFromProp: undefined,
		}
		expect(getFetcherName(props)).toBeUndefined()
	})

	it('should return undefined if resource.resource.meta.fetcherName is undefined and fetcherNameFromProp is not provided', () => {
		const props: GetFetcherNameProps = {
			resource: {
				resource: {
					meta: {
						// fetcherName is explicitly undefined
					},
				},
			} as ResolvedResource,
			fetcherNameFromProp: undefined,
		}
		expect(getFetcherName(props)).toBeUndefined()
	})
})
