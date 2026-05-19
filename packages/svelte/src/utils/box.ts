export interface ReadonlyBox<T> {
	readonly value: T
}

export interface Box<T> {
	value: T
}

export interface BoxAccessor<T> {
	get: () => T
	set: (value: T) => void
}

export type BoxSource<T> = (() => T) | BoxAccessor<T>

export function box<T>(
	source: () => T,
): ReadonlyBox<T>

export function box<T>(
	source: BoxAccessor<T>,
): Box<T>

export function box<T>(
	source: BoxSource<T>,
): Box<T> | ReadonlyBox<T> {
	if (typeof source === 'function') {
		return {
			get value() {
				return source()
			},
		}
	}

	if (source.set) {
		return {
			get value() {
				return source.get()
			},
			set value(nextValue) {
				source.set(nextValue)
			},
		}
	}

	return {
		get value() {
			return source.get()
		},
	}
}

export function unbox<T>(
	value: ReadonlyBox<T> | Box<T>,
): T {
	if (typeof value === 'object' && value != null && 'value' in value)
		return value.value
	return value
}

export function getBoxValue<T>(source: BoxSource<T>): T {
	if (typeof source === 'function')
		return source()

	return source.get()
}

export function setBoxValue<T>(source: BoxSource<T>, value: T): boolean {
	if (typeof source === 'object' && source.set) {
		source.set(value)
		return true
	}

	return false
}
