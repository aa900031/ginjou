export default eventHandler((event) => {
	setHeader(event, 'x-total-count', 2)
	return [
		{
			id: '1',
			name: `users-1`,
		},
		{
			id: '2',
			name: `users-2`,
		},
	]
})
