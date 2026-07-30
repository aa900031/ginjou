import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, unref } from 'vue-demi'
import { useClone } from './clone'

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

vi.mock('./resource', () => ({
	useResource: mocks.useResource,
}))

describe('useClone', () => {
	beforeEach(() => {
		mocks.useCreateOne.mockReset()
		mocks.useGetOne.mockReset()
		mocks.useNavigateTo.mockReset()
		mocks.useResource.mockReset()

		mocks.useResource.mockReturnValue(ref({
			action: 'clone',
			id: 'route-id',
			resource: { name: 'posts' },
		}))
		mocks.useNavigateTo.mockReturnValue(vi.fn())
	})

	it('should preserve the source record and prefer the id prop', () => {
		let queryProps: Record<string, any> | undefined
		const record = ref({ id: 'source-id', title: 'Source' })
		const query = {
			record,
			isFetching: ref(false),
		}
		const mutation = {
			isPending: ref(false),
			mutateAsync: vi.fn(),
		}
		mocks.useGetOne.mockImplementation((props) => {
			queryProps = props
			return query
		})
		mocks.useCreateOne.mockReturnValue(mutation)

		const result = useClone({ id: 'prop-id' })

		expect(unref(queryProps?.id)).toBe('prop-id')
		expect(result.record).toBe(record)
		expect(result.query).toBe(query)
		expect(unref(result.isLoading)).toBe(false)
	})
})
