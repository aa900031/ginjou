export default eventHandler((event) => {
	deleteCookie(event, 'auth_session', { path: '/' })
	return { ok: true }
})
