import type { ResolvedResource } from '../resource'

export interface GetResourceIdentifierProps {
	resource: ResolvedResource | undefined
	resourceFromProp?: string | undefined
}

export function getResourceIdentifier(
	{
		resource,
		resourceFromProp,
	}: GetResourceIdentifierProps,
): string | undefined {
	return resourceFromProp
		?? resource?.resource.name
}
