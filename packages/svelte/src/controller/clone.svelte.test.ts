import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useClone } from './clone.svelte'

const mocks = vi.hoisted(() => ({
	useCreateOne: vi.fn(),
	useGetOne: vi.fn(),
	useNavigateTo: vi.fn(),
	useResource: vi.fn(),
}))

vi.mock('../query', () => ({
	useCreateOne: mocks.useCreateOne,
	useGetOne: mocks.useGetOne,
}))

vi.mock('../router', () => ({
	useNavigateTo: mocks.useNavigateTo,
}))

vi.mock('./resource.svelte', () => ({
	useResource: mocks.useResource,
}))

describe('useClone', () => {
	beforeEach(() => {
		mocks.useCreateOne.mockReset()
		mocks.useGetOne.mockReset()
		mocks.useNavigateTo.mockReset()
		mocks.useResource.mockReset()

		mocks.useResource.mockReturnValue({
			value: {
				action: 'clone',
				id: 'route-id',
				resource: { name: 'posts' },
			},
		})
		mocks.useNavigateTo.mockReturnValue(vi.fn())
	})

	it('should preserve the source record and prefer the id prop', () => {
		let getQueryProps: (() => Record<string, any>) | undefined
		const record = { id: 'source-id', title: 'Source' }
		const query = {
			record,
			isFetching: false,
		}
		const mutation = {
			isPending: false,
			mutateAsync: vi.fn(),
		}
		mocks.useGetOne.mockImplementation((props) => {
			getQueryProps = props
			return query
		})
		mocks.useCreateOne.mockReturnValue(mutation)

		const result = useClone({ id: 'prop-id' })

		expect(getQueryProps?.().id).toBe('prop-id')
		expect(result.record).toBe(record)
		expect(result.query).toBe(query)
		expect(result.isLoading).toBe(false)
	})
})
