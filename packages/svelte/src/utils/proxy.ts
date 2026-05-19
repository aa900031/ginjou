import type { Merge } from 'type-fest'
import type { BoxSource } from './box'
import { getBoxValue, setBoxValue } from './box'

export function withAccessors<
	TBase extends Record<string, any>,
	TAccessor extends Record<string, BoxSource<any>>,
>(
	base: TBase,
	accessors: TAccessor,
): Merge<TBase, AccessorValues<TAccessor>> {
	return new Proxy(base, {
		get(target, prop, receiver) {
			if (Object.prototype.hasOwnProperty.call(accessors, prop))
				return getBoxValue(accessors[prop as string])
			return Reflect.get(target, prop, receiver)
		},
		set(target, prop, value, receiver) {
			if (Object.prototype.hasOwnProperty.call(accessors, prop))
				return setBoxValue(accessors[prop as string], value)
			return Reflect.set(target, prop, value, receiver)
		},
		has(target, prop) {
			if (Object.prototype.hasOwnProperty.call(accessors, prop))
				return true
			return Reflect.has(target, prop)
		},
	}) as any
}

type InferGetterValue<D>
	= D extends BoxSource<infer T> ? T : never

type AccessorValues<TAccessor extends Record<string, BoxSource<any>>> = {
	[Key in keyof TAccessor]: InferGetterValue<TAccessor[Key]>
}
