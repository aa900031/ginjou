import type {
	RouterBlockerController,
	RouterBlockerFn,
	RouterBlockerStateValues,
	RouterBlockShouldFn,
	RouterBlockShouldInput,
} from './router'
import { RouterBlockerState } from './router'

export { RouterBlockerState as State } from './router'
export type { RouterBlockerStateValues as StateValues } from './router'

export interface Props {
	enabled?: boolean
	shouldBlock: boolean | RouterBlockShouldFn
}

export const defaultEnabled = true

export function getEnabled(
	value: Props['enabled'],
): boolean {
	return value ?? defaultEnabled
}

export function resolveShouldBlock(
	value: Props['shouldBlock'],
	input: RouterBlockShouldInput,
): boolean {
	return typeof value === 'function'
		? value(input)
		: value
}

export interface CreateRegistryProps {
	/**
	 * Called when the registry gains its first blocker and when it loses its last, for whatever the
	 * adapter has to keep alive only while something can block — a page-unload guard, typically.
	 */
	onActive?: (active: boolean) => void
}

export interface Registry {
	create: RouterBlockerFn
	run: (input: RouterBlockShouldInput) => boolean | Promise<boolean>
	anyBlocking: (input: RouterBlockShouldInput) => boolean
	settle: () => void
	dispose: () => void
}

interface Member {
	shouldBlock: RouterBlockShouldFn
	enabled: boolean
	state: RouterBlockerStateValues
	release: ((proceeded: boolean) => void) | undefined
	handlers: Set<(state: RouterBlockerStateValues) => void>
	disposed: boolean
}

interface Transaction {
	id: number
	members: Member[]
	/**
	 * Whether a member is still being asked.
	 *
	 * A router reports the terminal outcome of a navigation it dropped some time after the
	 * replacement started, so a terminal signal arriving mid-decision belongs to the old one and
	 * settling on it would take the new hold away.
	 */
	waiting: boolean
}

/**
 * Owns registration order, the active navigation, and every state transition.
 *
 * This lives here rather than in each router adapter because none of it is router-specific: the
 * order blockers are asked in, what `proceed` on one of them means for the others, and which
 * outcomes have to put everyone back to `unblocked` are the same wherever the navigation is held.
 * An adapter is left with the two things only it knows — where its router can hold a navigation,
 * and which of its events are terminal.
 */
export function createRegistry(
	props?: CreateRegistryProps,
): Registry {
	const members = new Set<Member>()
	let latest = 0
	let current: Transaction | undefined
	/**
	 * How many members can currently block, which is not how many are registered: a page registers
	 * once and stays, and `onActive` is about whatever the adapter keeps alive only while something
	 * can actually hold a navigation.
	 */
	let enabledCount = 0

	return { create, run, anyBlocking, settle, dispose }

	function countEnabled(delta: number): void {
		const was = enabledCount
		enabledCount += delta
		if (was === 0 || enabledCount === 0)
			props?.onActive?.(enabledCount > 0)
	}

	function publish(
		member: Member,
		state: RouterBlockerStateValues,
	): void {
		if (member.state === state)
			return

		member.state = state
		member.handlers.forEach(handler => handler(state))
	}

	/** Ends the active navigation: everyone back to `unblocked`, whoever holds it lets it go. */
	function finish(): void {
		const transaction = current
		// Cleared first: publishing below can reach a synchronous subscriber that disposes or resets,
		// and the second pass has to find nothing left to end.
		current = undefined
		if (transaction == null)
			return

		for (const member of transaction.members) {
			const release = member.release
			member.release = undefined
			publish(member, RouterBlockerState.Unblocked)
			release?.(false)
		}
	}

	function create(
		shouldBlock: RouterBlockShouldFn,
	): RouterBlockerController {
		const member: Member = {
			shouldBlock,
			enabled: true,
			state: RouterBlockerState.Unblocked,
			handlers: new Set(),
			release: undefined,
			disposed: false,
		}
		members.add(member)
		countEnabled(1)

		return {
			get state() {
				return member.state
			},
			subscribe: (handler) => {
				member.handlers.add(handler)
				return () => {
					member.handlers.delete(handler)
				}
			},
			proceed: () => {
				if (member.state !== RouterBlockerState.Blocked)
					return

				const release = member.release
				member.release = undefined
				publish(member, RouterBlockerState.Proceeding)
				release?.(true)
			},
			reset: () => {
				if (member.state !== RouterBlockerState.Blocked)
					return

				finish()
			},
			setEnabled: (value) => {
				if (member.disposed || member.enabled === value)
					return

				member.enabled = value
				countEnabled(value ? 1 : -1)

				// Stepping out while it is the one being asked leaves the navigation waiting on
				// nothing, exactly as disposing would.
				if (!value && member.state === RouterBlockerState.Blocked)
					finish()
			},
			dispose: () => {
				if (member.disposed)
					return

				member.disposed = true
				members.delete(member)
				member.handlers.clear()

				// `blocked` is the one state where going away is a decision: this member is what the
				// navigation is waiting on and nothing is left to answer for it, so it cancels like a
				// `reset`. An approval already given stands, and the navigation runs on without it.
				if (member.state === RouterBlockerState.Blocked)
					finish()
				else
					member.state = RouterBlockerState.Unblocked

				if (member.enabled) {
					member.enabled = false
					countEnabled(-1)
				}
			},
		}
	}

	function run(
		input: RouterBlockShouldInput,
	): boolean | Promise<boolean> {
		// Snapshotted, and every predicate answers for the navigation at the point it started. One
		// registered while the user is deciding takes part in the next navigation, not this one.
		const participants = [...members].filter(member => member.enabled && member.shouldBlock(input))
		// Nothing to ask, so nothing to supersede either: a navigation nobody blocks passes through
		// without touching a hold someone is still deciding on. Ending it here would cancel it and
		// leave the answer still to come with nothing to apply it to.
		if (participants.length === 0)
			return true

		const id = ++latest
		finish()

		const transaction: Transaction = { id, members: participants, waiting: true }
		current = transaction
		return process(transaction)
	}

	async function process(
		transaction: Transaction,
	): Promise<boolean> {
		for (const member of transaction.members) {
			// Its owner went away before its turn. Asking it anyway would hold the navigation on
			// something with nothing left to answer for it.
			if (member.disposed)
				continue

			// Assigned before the state goes out, not after: a synchronous subscriber can decide or
			// dispose from inside the publish, and it needs something to answer with.
			let release!: (proceeded: boolean) => void
			const decision = new Promise<boolean>((resolve) => {
				release = resolve
			})
			member.release = release
			publish(member, RouterBlockerState.Blocked)

			const proceeded = await decision

			// Let go by a newer navigation rather than by an answer. It owns the members now, and
			// clearing `release` here would take its hold away.
			if (transaction.id !== latest)
				return false

			member.release = undefined
			if (!proceeded)
				return false
		}

		transaction.waiting = false
		return true
	}

	function anyBlocking(
		input: RouterBlockShouldInput,
	): boolean {
		for (const member of members) {
			if (member.enabled && member.shouldBlock(input))
				return true
		}

		return false
	}

	function settle(): void {
		if (current == null || current.waiting)
			return

		finish()
	}

	function dispose(): void {
		finish()

		members.clear()
		if (enabledCount > 0)
			countEnabled(-enabledCount)
	}
}
