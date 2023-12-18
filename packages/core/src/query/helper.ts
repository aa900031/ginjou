export async function fakeMany<
	TData,
>(
	promises: Promise<{ data: TData }>[],
) {
	return {
		data: (await Promise.all(promises)).map(res => res.data),
	}
}
