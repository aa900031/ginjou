/** What `BlockedPage.svelte` records, and how a test steers its confirm. */
export const probe = {
	/** Bumped on every init of `BlockedPage.svelte`, so a remount is visible. */
	mounts: 0,
	confirms: 0,
	/** What the stand-in for `window.confirm` answers; `undefined` never answers at all. */
	confirmResult: false as boolean | undefined,
	/** Every location the router reported to the page while it was mounted. */
	locations: [] as (string | undefined)[],
}

export function resetProbe(): void {
	probe.mounts = 0
	probe.confirms = 0
	probe.confirmResult = false
	probe.locations = []
}
