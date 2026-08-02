import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter } from './router'

const mocks = vi.hoisted(() => ({
	onBeforeRouteLeave: vi.fn(),
	push: vi.fn(),
	stop: vi.fn(),
	watch: vi.fn(),
}))

vi.mock('vue-router', () => ({
	onBeforeRouteLeave: mocks.onBeforeRouteLeave,
	useRouter: () => ({
		back: vi.fn(),
		currentRoute: {
			value: {
				hash: '#current',
				params: {},
				path: '/current',
				query: { page: '1' },
			},
		},
		push: mocks.push,
		resolve: vi.fn(),
	}),
}))

vi.mock('vue-demi', () => ({
	watch: mocks.watch,
}))

describe('createRouter', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mocks.watch.mockReturnValue(mocks.stop)
	})

	it('maps navigation and registers its location cleanup', () => {
		const router = createRouter()

		router.go({ to: '/next', type: 'replace', keepQuery: true })
		const cleanup = router.onChangeLocation(vi.fn())

		expect(mocks.push).toHaveBeenCalledWith({
			path: '/next',
			query: { page: '1' },
			replace: true,
		})
		expect(mocks.onBeforeRouteLeave).toHaveBeenCalledWith(mocks.stop)
		expect(cleanup).toBe(mocks.stop)
	})
})
