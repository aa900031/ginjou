export function toMethod(
	method: string,
): string {
	switch (method) {
		case 'put':
			return 'PUT'
		case 'post':
			return 'POST'
		case 'patch':
			return 'PATCH'
		case 'delete':
			return 'DELETE'
		default:
			return 'GET'
	}
}
