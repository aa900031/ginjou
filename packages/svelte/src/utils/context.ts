import { getContext, setContext } from 'svelte'

export function defineContext<T>(key: symbol, value: T): T {
	setContext(key, value)
	return value
}

export function useContextValue<T>(key: symbol, value?: T): T | undefined {
	return getContext<T | undefined>(key) ?? value
}

export function requireContext<T>(value: T | undefined, name: string): T {
	if (value == null)
		throw new Error(`[@ginjou/svelte] No '${name}' found in context.`)

	return value
}
