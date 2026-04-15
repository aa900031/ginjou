export default eventHandler(async (event) => {
	const body = await readBody(event)

	if (body?.email !== 'admin@example.com' || body?.password !== 'password') {
		throw createError({
			statusCode: 401,
			message: 'Invalid email or password',
		})
	}

	setCookie(event, 'auth_session', JSON.stringify({ name: 'Admin', email: 'admin@example.com' }), {
		httpOnly: true,
		maxAge: 60 * 60 * 24 * 7,
		// sameSite: 'lax',
		path: '/',
	})

	return { ok: true }
})
