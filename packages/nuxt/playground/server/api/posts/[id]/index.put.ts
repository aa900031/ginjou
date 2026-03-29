export default eventHandler((event) => {
	const id = getRouterParam(event, 'id')
	const body = readBody(event)

	return {
		id,
		...body,
	}
})
