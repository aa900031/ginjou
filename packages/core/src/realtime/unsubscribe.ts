export type UnsubscribeKey = string

export type UnsubscribeProps =
	| UnsubscribeKey

export type UnsubscribeFn = (
	props: UnsubscribeProps,
) => void
