export default eventHandler((event) => {
	setHeader(event, 'x-total-count', 2)

	return [
		{
			id: '1',
			name: `posts-1`,
			user: `1`,
		},
		{
			id: '2',
			name: `posts-2`,
			user: `2`,
		},
	]
})
