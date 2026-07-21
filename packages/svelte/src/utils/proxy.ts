import type { Merge } from 'type-fest'

export function withAccessors<
	TBase extends Record<string, any>,
	TAccessor extends Record<string, AccessorDefConstraint>,
>(
	base: TBase,
	accessors: TAccessor,
): Merge<TBase, AccessorValues<TAccessor>> {
	return new Proxy(base, {
		get(target, prop, receiver) {
			if (Object.hasOwn(accessors, prop))
				return callGetter(accessors[prop as string])
			return Reflect.get(target, prop, receiver)
		},
		set(target, prop, value, receiver) {
			if (Object.hasOwn(accessors, prop))
				return callSetter(accessors[prop as string], value)
			return Reflect.set(target, prop, value, receiver)
		},
		has(target, prop) {
			if (Object.hasOwn(accessors, prop))
				return true
			return Reflect.has(target, prop)
		},
	}) as any
}

type AccessorDefConstraint
	= | (() => unknown)
		| { get: () => unknown, set?: (v: any) => any }

type InferGetterValue<D>
	= D extends (() => infer T) ? T
		: D extends { get: () => infer T } ? T
			: never

type AccessorValues<TAccessor extends Record<string, AccessorDefConstraint>> = {
	[Key in keyof TAccessor]: InferGetterValue<TAccessor[Key]>
}

function callGetter(def: AccessorDefConstraint): unknown {
	return typeof def === 'function' ? def() : def.get()
}

function callSetter(def: AccessorDefConstraint, value: unknown): boolean {
	if (typeof def === 'object' && def.set) {
		def.set(value)
		return true
	}
	return false
}
