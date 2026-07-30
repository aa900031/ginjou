export function toMethod(
	method: string,
): string {
	switch (method) {
		case 'put':
		case 'post':
		case 'patch':
		case 'delete':
			return method.toUpperCase()
		default:
			return 'GET'
	}
}
