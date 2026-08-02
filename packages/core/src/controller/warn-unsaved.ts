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
export const defaultConfirm: ConfirmFn = () => globalThis.confirm?.(DEFAULT_MESSAGE) ?? true

export const defaultEnabled = false

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

	return getPropsEnabledFromProp(fromController) ?? defaultEnabled
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

export async function handleBlocked(
	props: HandleBlockedProps,
): Promise<void> {
	const { blocked, confirming, confirm, setConfirming, proceed, reset } = props

	if (!blocked || confirming)
		return

	setConfirming(true)
	let confirmed: boolean
	try {
		confirmed = await confirm()
	}
	catch {
		confirmed = false
	}
	setConfirming(false)

	if (confirmed)
		proceed()
	else
		reset()
}
