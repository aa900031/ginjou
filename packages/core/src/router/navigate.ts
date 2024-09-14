import type { Simplify } from 'type-fest'
import type { Resource, ResourceActionTypeValues } from '../resource'
import { ResourceActionType, createResourcePath, resolveResource } from '../resource'
import type { RecordKey } from '../query'
import type { RouterGoFn, RouterGoParams } from './go'

export interface CreateNavigateToProps {
	resourceContext: Resource
	go: RouterGoFn
}

export type ToListProps = Simplify<
	& Omit<
		RouterGoParams,
		| 'to'
	>
	& {
		resource: string
		params?: Record<string, any>
	}
>

export function createToList(
	{
		resourceContext,
		go,
	}: CreateNavigateToProps,
) {
	return function toList(
		{
			resource: resourceName,
			params,
			...rest
		}: ToListProps,
	): void {
		const path = createToPath({
			resourceContext,
			action: ResourceActionType.List,
			name: resourceName,
			params,
		})

		return go({
			...rest,
			to: path,
		})
	}
}

export type ToCreateProps = Simplify<
	& Omit<
		RouterGoParams,
		| 'to'
	>
	& {
		resource: string
		params?: Record<string, any>
	}
>

export function createToCreate(
	{
		resourceContext,
		go,
	}: CreateNavigateToProps,
) {
	return function toCreate(
		{
			resource: resourceName,
			params,
			...rest
		}: ToCreateProps,
	) {
		const path = createToPath({
			resourceContext,
			action: ResourceActionType.Create,
			name: resourceName,
			params,
		})

		return go({
			...rest,
			to: path,
		})
	}
}

export type ToEditProps = Simplify<
	& Omit<
		RouterGoParams,
		| 'to'
	>
	& {
		resource: string
		id: RecordKey
		params?: Record<string, any>
	}
>

export function createToEdit(
	{
		resourceContext,
		go,
	}: CreateNavigateToProps,
) {
	return function toEdit(
		{
			resource: resourceName,
			id,
			params,
			...rest
		}: ToEditProps,
	) {
		const path = createToPath({
			resourceContext,
			action: ResourceActionType.Edit,
			name: resourceName,
			params: {
				id,
				...params,
			},
		})

		return go({
			...rest,
			to: path,
		})
	}
}

export type ToShowProps = Simplify<
	& Omit<
		RouterGoParams,
		| 'to'
	>
	& {
		resource: string
		id: RecordKey
		params?: Record<string, any>
	}
>

export function createToShow(
	{
		resourceContext,
		go,
	}: CreateNavigateToProps,
) {
	return function toShow(
		{
			resource: resourceName,
			id,
			params,
			...rest
		}: ToShowProps,
	) {
		const path = createToPath({
			resourceContext,
			action: ResourceActionType.Show,
			name: resourceName,
			params: {
				id,
				...params,
			},
		})

		return go({
			...rest,
			to: path,
		})
	}
}

interface CreateToPathProps {
	resourceContext: Resource
	name: string
	action: ResourceActionTypeValues
	params?: Record<string, any>
}

function createToPath(
	{
		resourceContext,
		name,
		action,
		params,
	}: CreateToPathProps,
): string | undefined {
	const resolved = resolveResource(
		resourceContext,
		{ name },
	)

	const path = createResourcePath({
		resolved,
		action,
		params,
	})

	return path
}
