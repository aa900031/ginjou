export interface ReadonlyBox<T> {
	readonly value: T
}

export interface Box<T, S = T> {
	get value(): T
	set value(_: S)
}

export type BoxGetter<T> = () => T

export type BoxSetter<T> = (nextValue: T) => void

export interface WritableBoxOptions<T, S = T> {
	get: BoxGetter<T>
	set: BoxSetter<S>
}

export function box<T>(
	getter: BoxGetter<T>,
): ReadonlyBox<T>

export function box<T, S = T>(
	options: WritableBoxOptions<T, S>,
): Box<T, S>

export function box<T>(
	getterOrOptions: BoxGetter<T> | WritableBoxOptions<T>,
): Box<T> | ReadonlyBox<T> {
	let getter: BoxGetter<T>
	let setter: BoxSetter<T> | undefined

	if (typeof getterOrOptions === 'function') {
		getter = getterOrOptions
	}
	else {
		getter = getterOrOptions.get
		setter = getterOrOptions.set
	}

	if (setter) {
		return {
			get value() {
				return getter()
			},
			set value(nextValue) {
				setter(nextValue)
			},
		}
	}

	return {
		get value() {
			return getter()
		},
	}
}

export function unbox<T>(
	value: ReadonlyBox<T> | Box<T>,
): T {
	return isBox(value) ? value.value : value
}

export function isBox(
	value: unknown,
): value is Box<any> {
	return value != null && typeof value === 'object' && 'value' in value
}
