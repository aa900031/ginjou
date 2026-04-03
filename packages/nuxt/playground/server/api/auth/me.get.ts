export default eventHandler((event) => {
	const raw = getCookie(event, 'auth_session')
	if (!raw) {
		throw createError({ statusCode: 401, message: 'Unauthorized' })
	}
	try {
		return JSON.parse(raw)
	}
	catch {
		throw createError({ statusCode: 401, message: 'Unauthorized' })
	}
})
