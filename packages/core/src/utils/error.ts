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

export function reportUnhandledError(
	error: unknown,
): void {
	void Promise.reject(error)
}

export function isNotFoundError(
	error: unknown,
): boolean {
	if (typeof error !== 'object' || error == null)
		return false

	const { status, statusCode, response } = error as {
		status?: unknown
		statusCode?: unknown
		response?: { status?: unknown }
	}
	return status === 404
		|| statusCode === 404
		|| response?.status === 404
}
