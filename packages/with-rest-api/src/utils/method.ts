export function toMethod(
	method: string,
): string {
	switch (method) {
		case 'put':
		case 'post':
		case 'patch':
			return 'PUT'
		case 'delete':
			return 'DELETE'
		default:
			return 'GET'
	}
}
