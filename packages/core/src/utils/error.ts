export function getErrorMessage(
	error: unknown,
): string | undefined {
	if (typeof error === 'string')
		return error
	if (typeof error === 'object' && error != null) {
		if ('message' in error && typeof error.message === 'string')
			return error.message
		if ('name' in error && typeof error.name === 'string')
			return error.name
	}
}
