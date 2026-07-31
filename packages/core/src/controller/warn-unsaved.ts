import type { ValueOf } from 'type-fest'

export type ConfirmFn = () => boolean | Promise<boolean>

export interface Props {
	enabled?: boolean
	confirm?: ConfirmFn
}

export type Prop
	= | boolean
		| Props
		| undefined

export const State = {
	Inactive: 'inactive',
	Active: 'active',
	Confirming: 'confirming',
} as const

export type StateValues = ValueOf<typeof State>

export const DEFAULT_MESSAGE = 'You have unsaved changes. Are you sure you want to leave this page?'

// eslint-disable-next-line no-alert -- the native confirm is the documented default, callers override it
const defaultConfirm: ConfirmFn = () => globalThis.confirm?.(DEFAULT_MESSAGE) ?? true

export function getPropsEnabledFromProp(
	prop: Prop,
): Props['enabled'] {
	if (typeof prop === 'boolean')
		return prop

	return prop?.enabled
}

export function getPropsConfirmFromProp(
	prop: Prop,
): Props['confirm'] {
	if (prop != null && (typeof prop !== 'boolean'))
		return prop.confirm
}

export interface GetEnabledProps {
	fromProp: boolean | undefined
	fromController: Prop
}

export function getEnabled(
	props: GetEnabledProps,
): boolean {
	const { fromProp, fromController } = props

	if (fromProp != null)
		return fromProp

	return getPropsEnabledFromProp(fromController) ?? false
}

export interface GetConfirmProps {
	fromProp: ConfirmFn | undefined
	fromController: Prop
}

export function getConfirm(
	props: GetConfirmProps,
): ConfirmFn {
	const { fromProp, fromController } = props

	if (fromProp != null)
		return fromProp

	return getPropsConfirmFromProp(fromController) ?? defaultConfirm
}

export interface GetStateProps {
	enabled: boolean
	active: boolean
	confirming: boolean
}

export function getState(
	props: GetStateProps,
): StateValues {
	const { enabled, active, confirming } = props

	if (confirming)
		return State.Confirming

	return enabled && active
		? State.Active
		: State.Inactive
}

export interface HandleBlockedProps {
	/** Whether the route blocker is currently holding the navigation. */
	blocked: boolean
	/** Whether the user is already being asked, used to guard against reentry. */
	confirming: boolean
	confirm: ConfirmFn
	setConfirming: (value: boolean) => void
	proceed: () => void
	reset: () => void
}

/**
 * Asks the user for confirmation while a navigation is blocked, then lets the
 * blocker proceed or resets it.
 *
 * Meant for framework layer hooks such as `useWarnUnsaved`, which own the
 * reactive `confirming` flag and translate their route blocker state into the
 * `blocked` boolean.
 */
export async function handleBlocked(
	props: HandleBlockedProps,
): Promise<void> {
	const { blocked, confirming, confirm, setConfirming, proceed, reset } = props

	if (!blocked || confirming)
		return

	setConfirming(true)
	const confirmed = await confirm()
	setConfirming(false)

	if (confirmed)
		proceed()
	else
		reset()
}
