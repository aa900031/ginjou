import type { ValueOf } from 'type-fest'

export const RealtimeMode = {
	Off: 'off',
	Auto: 'auto',
	Manual: 'manual',
} as const

export type RealtimeModeValue = ValueOf<typeof RealtimeMode>
