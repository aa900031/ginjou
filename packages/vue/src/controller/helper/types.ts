import type { MaybeRef } from 'vue-demi'

export type RecordMaybeRef<T extends Record<string, any>> = {
	[K in keyof T]: MaybeRef<T[K]>;
}

export type UnwrapRecordMaybeRef<T extends Record<string, MaybeRef<any>>> = {
	[K in keyof T]: T[K] extends MaybeRef<infer P> ? P : never;
}
