import type { RouterBlockerController, RouterBlockShouldInput } from './router'
import { describe, expect, it, vi } from 'vitest'
import { createRegistry, resolveShouldBlock, State } from './router-blocker'

/** A missing `nextLocation` is what marks the page being unloaded rather than navigated. */
function createBlockerContext(
	unload = false,
): RouterBlockShouldInput {
	return {
		currentLocation: { path: '/posts' },
		nextLocation: unload ? undefined : { path: '/posts/1' },
	}
}

const INPUT = createBlockerContext()

async function advance(): Promise<void> {
	await Promise.resolve()
	await Promise.resolve()
}

function states(
	...controllers: RouterBlockerController[]
): string[] {
	return controllers.map(controller => controller.state)
}

describe('resolveShouldBlock', () => {
	it('should pass a boolean through', () => {
		expect(resolveShouldBlock(true, INPUT)).toBe(true)
		expect(resolveShouldBlock(false, INPUT)).toBe(false)
	})

	it('should call a function with the untouched input', () => {
		const fn = vi.fn((_input: RouterBlockShouldInput): boolean => true)

		expect(resolveShouldBlock(fn, INPUT)).toBe(true)
		expect(fn).toHaveBeenCalledOnce()
		expect(fn.mock.calls[0][0]).toBe(INPUT)
	})
})

describe('createRegistry', () => {
	describe('run', () => {
		it('should allow the navigation synchronously when nothing is registered', () => {
			expect(createRegistry().run(INPUT)).toBe(true)
		})

		it('should allow the navigation synchronously when no blocker blocks it', () => {
			const registry = createRegistry()
			registry.create(() => false)
			registry.create(() => false)

			expect(registry.run(INPUT)).toBe(true)
		})

		it('should hold the navigation until the blocker answers', async () => {
			const registry = createRegistry()
			const controller = registry.create(() => true)

			const navigation = registry.run(INPUT)

			expect(controller.state).toBe(State.Blocked)
			await expect(Promise.race([navigation, 'pending'])).resolves.toBe('pending')

			controller.proceed()

			await expect(navigation).resolves.toBe(true)
		})

		it('should pass the input untouched to every predicate', () => {
			const registry = createRegistry()
			const first = vi.fn((_input: RouterBlockShouldInput): boolean => false)
			const second = vi.fn((_input: RouterBlockShouldInput): boolean => false)
			registry.create(first)
			registry.create(second)

			registry.run(INPUT)

			expect(first.mock.calls[0][0]).toBe(INPUT)
			expect(second.mock.calls[0][0]).toBe(INPUT)
		})

		// A false / B true => B blocks.
		it('should only take the blockers whose predicate answers true', async () => {
			const registry = createRegistry()
			const passive = registry.create(() => false)
			const blocking = registry.create(() => true)

			const navigation = registry.run(INPUT)

			expect(states(passive, blocking)).toEqual([State.Unblocked, State.Blocked])

			blocking.proceed()

			await expect(navigation).resolves.toBe(true)
		})

		// Only the one being asked is `blocked`; the rest of the queue stays `unblocked`, so a
		// consumer that opens a dialog on `blocked` opens one at a time.
		it('should ask the blockers one at a time in registration order', async () => {
			const registry = createRegistry()
			const first = vi.fn(() => true)
			const second = vi.fn(() => true)
			const firstController = registry.create(first)
			const secondController = registry.create(second)

			const navigation = registry.run(INPUT)

			expect(states(firstController, secondController)).toEqual([State.Blocked, State.Unblocked])

			firstController.proceed()
			await advance()

			expect(states(firstController, secondController)).toEqual([State.Proceeding, State.Blocked])

			secondController.proceed()

			await expect(navigation).resolves.toBe(true)
		})

		// A proceed / B reset => navigation cancelled, and both are settled.
		it('should cancel the whole navigation when a later blocker resets', async () => {
			const registry = createRegistry()
			const first = registry.create(() => true)
			const second = registry.create(() => true)

			const navigation = registry.run(INPUT)
			first.proceed()
			await advance()
			second.reset()

			await expect(navigation).resolves.toBe(false)
			expect(states(first, second)).toEqual([State.Unblocked, State.Unblocked])
		})

		it('should ignore an answer from a blocker that is not being asked', async () => {
			const registry = createRegistry()
			const first = registry.create(() => true)
			const second = registry.create(() => true)

			const navigation = registry.run(INPUT)

			// Still queued, so neither answer is its to give.
			second.proceed()
			second.reset()

			expect(second.state).toBe(State.Unblocked)
			await expect(Promise.race([navigation, 'pending'])).resolves.toBe('pending')

			first.proceed()
			await advance()
			second.proceed()

			await expect(navigation).resolves.toBe(true)
		})

		// A blocker registered while the user is deciding belongs to the next navigation.
		it('should not ask a blocker registered after the navigation started', async () => {
			const registry = createRegistry()
			const holder = registry.create(() => true)

			const navigation = registry.run(INPUT)

			const late = vi.fn(() => true)
			registry.create(late)
			holder.proceed()

			await expect(navigation).resolves.toBe(true)
			expect(late).not.toHaveBeenCalled()
		})

		it('should re-evaluate the predicates for every navigation', () => {
			const registry = createRegistry()
			const shouldBlock = vi.fn(() => false)
			registry.create(shouldBlock)

			registry.run(INPUT)
			registry.run(INPUT)

			expect(shouldBlock).toHaveBeenCalledTimes(2)
		})

		// A predicate turning false does not settle a decision already being asked.
		it('should keep holding a navigation whose predicate stopped blocking', async () => {
			const registry = createRegistry()
			let blocking = true
			const controller = registry.create(() => blocking)

			const navigation = registry.run(INPUT)
			blocking = false

			expect(controller.state).toBe(State.Blocked)
			await expect(Promise.race([navigation, 'pending'])).resolves.toBe('pending')

			controller.reset()

			await expect(navigation).resolves.toBe(false)
		})
	})

	describe('proceed', () => {
		it('should publish proceeding and stay there until the navigation ends', async () => {
			const registry = createRegistry()
			const controller = registry.create(() => true)

			const navigation = registry.run(INPUT)
			controller.proceed()

			expect(controller.state).toBe(State.Proceeding)
			await expect(navigation).resolves.toBe(true)
			expect(controller.state).toBe(State.Proceeding)

			registry.settle()

			expect(controller.state).toBe(State.Unblocked)
		})
	})

	describe('reset', () => {
		it('should cancel the navigation and settle', async () => {
			const registry = createRegistry()
			const controller = registry.create(() => true)

			const navigation = registry.run(INPUT)
			controller.reset()

			expect(controller.state).toBe(State.Unblocked)
			await expect(navigation).resolves.toBe(false)
		})
	})

	describe('subscribe', () => {
		it('should report every transition', async () => {
			const registry = createRegistry()
			const controller = registry.create(() => true)
			const handler = vi.fn()
			controller.subscribe(handler)

			const navigation = registry.run(INPUT)
			controller.proceed()
			await navigation
			registry.settle()

			expect(handler.mock.calls.flat()).toEqual([State.Blocked, State.Proceeding, State.Unblocked])
		})

		it('should stop reporting after the teardown it returns', () => {
			const registry = createRegistry()
			const controller = registry.create(() => true)
			const handler = vi.fn()

			controller.subscribe(handler)()
			registry.run(INPUT)

			expect(handler).not.toHaveBeenCalled()
		})

		it('should survive a subscriber that resets from inside the publish', async () => {
			const registry = createRegistry()
			const controller = registry.create(() => true)
			controller.subscribe((state) => {
				if (state === State.Blocked)
					controller.reset()
			})

			await expect(registry.run(INPUT)).resolves.toBe(false)
			expect(controller.state).toBe(State.Unblocked)
		})

		it('should survive a subscriber that disposes from inside the publish', async () => {
			const registry = createRegistry()
			const controller = registry.create(() => true)
			controller.subscribe((state) => {
				if (state === State.Blocked)
					controller.dispose()
			})

			await expect(registry.run(INPUT)).resolves.toBe(false)
		})
	})

	describe('settle', () => {
		it('should settle every participant of an approved navigation', async () => {
			const registry = createRegistry()
			const first = registry.create(() => true)
			const second = registry.create(() => true)

			const navigation = registry.run(INPUT)
			first.proceed()
			await advance()
			second.proceed()
			await navigation

			expect(states(first, second)).toEqual([State.Proceeding, State.Proceeding])

			registry.settle()

			expect(states(first, second)).toEqual([State.Unblocked, State.Unblocked])
		})

		it('should do nothing when no navigation is riding on the blockers', () => {
			const registry = createRegistry()
			const controller = registry.create(() => true)

			registry.settle()

			expect(controller.state).toBe(State.Unblocked)
		})

		// The terminal signal of a navigation the router dropped arrives after its replacement has
		// already started asking. Settling on it would take the new hold away.
		it('should ignore a terminal signal that arrives while a decision is pending', async () => {
			const registry = createRegistry()
			const controller = registry.create(() => true)

			const superseded = registry.run(INPUT)
			const latest = registry.run(INPUT)
			await expect(superseded).resolves.toBe(false)

			registry.settle()

			expect(controller.state).toBe(State.Blocked)

			controller.proceed()
			await expect(latest).resolves.toBe(true)
		})
	})

	describe('supersede', () => {
		it('should settle the participants of the navigation it replaces', async () => {
			const registry = createRegistry()
			const first = registry.create(() => true)
			const second = registry.create(() => true)

			const superseded = registry.run(INPUT)
			first.proceed()
			await advance()

			expect(states(first, second)).toEqual([State.Proceeding, State.Blocked])

			const latest = registry.run(INPUT)

			await expect(superseded).resolves.toBe(false)
			expect(states(first, second)).toEqual([State.Blocked, State.Unblocked])

			first.proceed()
			await advance()
			second.proceed()
			await expect(latest).resolves.toBe(true)
		})

		it('should leave a hold alone when the navigation passing through blocks nobody', async () => {
			const registry = createRegistry()
			let blocking = true
			const controller = registry.create(() => blocking)

			const held = registry.run(INPUT)
			await advance()
			expect(controller.state).toBe(State.Blocked)

			// A query-only push from elsewhere on the page while the user is still deciding.
			blocking = false
			expect(registry.run(INPUT)).toBe(true)
			expect(controller.state).toBe(State.Blocked)

			controller.proceed()
			await expect(held).resolves.toBe(true)
		})

		it('should make an answer to the replaced navigation a no-op', async () => {
			const registry = createRegistry()
			const controller = registry.create(() => true)

			const superseded = registry.run(INPUT)
			const latest = registry.run(INPUT)
			await expect(superseded).resolves.toBe(false)

			// Belongs to the navigation that took over, so it must still be answerable.
			controller.proceed()

			await expect(latest).resolves.toBe(true)
		})
	})

	describe('dispose', () => {
		it('should not be asked once disposed', () => {
			const registry = createRegistry()
			const shouldBlock = vi.fn(() => true)
			registry.create(shouldBlock).dispose()

			expect(registry.run(INPUT)).toBe(true)
			expect(shouldBlock).not.toHaveBeenCalled()
		})

		it('should be skipped when disposed before its turn', async () => {
			const registry = createRegistry()
			const holder = registry.create(() => true)
			const queued = registry.create(() => true)

			const navigation = registry.run(INPUT)
			queued.dispose()
			holder.proceed()

			await expect(navigation).resolves.toBe(true)
			expect(queued.state).toBe(State.Unblocked)
		})

		// Nothing is left to answer for it, so going away while holding is a cancel, not an allow.
		it('should cancel the navigation when disposed while blocked', async () => {
			const registry = createRegistry()
			const holder = registry.create(() => true)
			const queued = registry.create(() => true)

			const navigation = registry.run(INPUT)
			holder.dispose()

			await expect(navigation).resolves.toBe(false)
			expect(queued.state).toBe(State.Unblocked)
		})

		it('should keep its approval when disposed while proceeding', async () => {
			const registry = createRegistry()
			const approved = registry.create(() => true)
			const queued = registry.create(() => true)

			const navigation = registry.run(INPUT)
			approved.proceed()
			await advance()
			approved.dispose()

			expect(queued.state).toBe(State.Blocked)

			queued.proceed()

			await expect(navigation).resolves.toBe(true)
		})

		it('should stop reporting once disposed', () => {
			const registry = createRegistry()
			const controller = registry.create(() => true)
			const handler = vi.fn()
			controller.subscribe(handler)

			controller.dispose()
			registry.run(INPUT)

			expect(handler).not.toHaveBeenCalled()
		})

		it('should be safe to call twice', () => {
			const registry = createRegistry()
			const controller = registry.create(() => true)

			controller.dispose()
			controller.dispose()

			expect(registry.run(INPUT)).toBe(true)
		})
	})

	describe('registry dispose', () => {
		it('should settle a held navigation and drop every blocker', async () => {
			const registry = createRegistry()
			const controller = registry.create(() => true)

			const navigation = registry.run(INPUT)
			registry.dispose()

			await expect(navigation).resolves.toBe(false)
			expect(controller.state).toBe(State.Unblocked)
			expect(registry.run(INPUT)).toBe(true)
		})
	})

	// What an adapter guards a page unload with: there is nothing to hold, so nothing is published.
	describe('anyBlocking', () => {
		const UNLOAD = createBlockerContext(true)

		it('should be false with nothing registered', () => {
			expect(createRegistry().anyBlocking(UNLOAD)).toBe(false)
		})

		it('should be true when any blocker answers true', () => {
			const registry = createRegistry()
			registry.create(() => false)
			registry.create(() => true)

			expect(registry.anyBlocking(UNLOAD)).toBe(true)
		})

		it('should be false when no blocker answers true', () => {
			const registry = createRegistry()
			registry.create(() => false)

			expect(registry.anyBlocking(UNLOAD)).toBe(false)
		})

		it('should stop after the first blocker that answers true', () => {
			const registry = createRegistry()
			const later = vi.fn(() => true)
			registry.create(() => true)
			registry.create(later)

			registry.anyBlocking(UNLOAD)

			expect(later).not.toHaveBeenCalled()
		})

		it('should pass the input untouched', () => {
			const registry = createRegistry()
			const shouldBlock = vi.fn((_input: RouterBlockShouldInput): boolean => false)
			registry.create(shouldBlock)

			registry.anyBlocking(UNLOAD)

			expect(shouldBlock).toHaveBeenCalledWith(UNLOAD)
		})

		it('should not touch the state of a blocker that answers true', () => {
			const registry = createRegistry()
			const controller = registry.create(() => true)

			registry.anyBlocking(UNLOAD)

			expect(controller.state).toBe(State.Unblocked)
		})

		it('should not consider a disposed blocker', () => {
			const registry = createRegistry()
			registry.create(() => true).dispose()

			expect(registry.anyBlocking(UNLOAD)).toBe(false)
		})
	})

	describe('onActive', () => {
		it('should report the first registration and the loss of the last', () => {
			const onActive = vi.fn()
			const registry = createRegistry({ onActive })

			const first = registry.create(() => true)
			const second = registry.create(() => true)

			expect(onActive.mock.calls.flat()).toEqual([true])

			first.dispose()

			expect(onActive.mock.calls.flat()).toEqual([true])

			second.dispose()

			expect(onActive.mock.calls.flat()).toEqual([true, false])
		})

		it('should report again once a blocker comes back', () => {
			const onActive = vi.fn()
			const registry = createRegistry({ onActive })

			registry.create(() => true).dispose()
			registry.create(() => true)

			expect(onActive.mock.calls.flat()).toEqual([true, false, true])
		})

		it('should report the registry being disposed', () => {
			const onActive = vi.fn()
			const registry = createRegistry({ onActive })
			registry.create(() => true)

			registry.dispose()

			expect(onActive.mock.calls.flat()).toEqual([true, false])
		})

		it('should not report a registry disposed with nothing registered', () => {
			const onActive = vi.fn()

			createRegistry({ onActive }).dispose()

			expect(onActive).not.toHaveBeenCalled()
		})
	})
})
