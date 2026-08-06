import type { ValueOf } from 'type-fest'

export const RouterGoType = {
	Push: 'push',
	Replace: 'replace',
} as const

export type RouterGoTypeValues = ValueOf<typeof RouterGoType>

export interface RouterGoParams<
	TMeta = unknown,
> {
	to?: string
	type?: RouterGoTypeValues
	query?: Record<string, string | number | null | undefined>
	hash?: string
	keepHash?: boolean
	keepQuery?: boolean
	meta?: TMeta
}

export type RouterGoFn<
	TMeta,
> = (
	params: RouterGoParams<TMeta>,
) => void

export type RouterBackFn = () => void

export interface RouterLocation<
	TMeta = unknown,
> {
	path: string
	/**
	 * Object of decoded params extracted from the `path`.
	 */
	params?: Record<string, string | string[]>
	query?: Record<string, string | null | ((string | null)[])>
	hash?: string
	meta?: TMeta
}

export type RouterLocationGetFn<
	TMeta,
> = () => RouterLocation<TMeta>

export type RouterLocationOnChangeFn<
	TMeta,
> = (
	handler: (value: RouterLocation<TMeta>) => void,
) => () => void

export type RouterResolveFn<
	TGoMeta,
> = (
	to: RouterGoParams<TGoMeta>,
) => string

export interface Router {
	go: RouterGoFn<any>
	back: RouterBackFn
	resolve: RouterResolveFn<any>
	getLocation: RouterLocationGetFn<any>
	onChangeLocation: RouterLocationOnChangeFn<any>
	blocker?: RouterBlockerFn
}

export interface RouterBlockShouldInput<
	TMeta = unknown,
> {
	currentLocation: RouterLocation<TMeta>
	/** Absent when the page is being unloaded rather than navigated. */
	nextLocation: RouterLocation<TMeta> | undefined
}

export type RouterBlockShouldFn = (
	input: RouterBlockShouldInput<any>,
) => boolean

export const RouterBlockerState = {
	Unblocked: 'unblocked',
	Blocked: 'blocked',
	Proceeding: 'proceeding',
} as const

export type RouterBlockerStateValues = ValueOf<typeof RouterBlockerState>

/**
 * One blocker's side of a navigation.
 *
 * `state` is per blocker, not per navigation: `proceeding` means this one has approved, and says
 * nothing about whether the navigation happened — a later blocker can still cancel it. Every
 * terminal outcome, including a cancel, brings it back to `unblocked`.
 */
export interface RouterBlockerController {
	readonly state: RouterBlockerStateValues
	subscribe: (
		handler: (state: RouterBlockerStateValues) => void,
	) => () => void
	/** Approve the held navigation and hand it to the next blocker. No-op unless `blocked`. */
	proceed: () => void
	/** Cancel the held navigation for every participant. No-op unless `blocked`. */
	reset: () => void
	/**
	 * Whether this one takes part at all. Registration is what fixes the order blockers are asked
	 * in, so a blocker that comes and goes with a flag toggles this instead of registering again
	 * and losing its place.
	 */
	setEnabled: (value: boolean) => void
	dispose: () => void
}

export interface RouterBlockerProps {
	should: RouterBlockShouldFn
	/**
	 * Whether it takes part from the moment it registers, so a page that is set up switched off never
	 * counts as one that can block. `setEnabled` is the same switch afterwards.
	 */
	enabled: boolean
}

export type RouterBlockerFn = (
	props: RouterBlockerProps,
) => RouterBlockerController

/* @__NO_SIDE_EFFECTS__ */
export function defineRouter<
	T extends Router,
>(
	value: T,
): T {
	return value
}
