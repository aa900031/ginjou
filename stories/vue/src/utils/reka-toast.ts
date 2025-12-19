import type { Ref } from 'vue'
import { injectLocal, provideLocal } from '@vueuse/core'
import { ref } from 'vue'

export interface ToastOptions {
	id: string
	title?: string
	description?: string
	severity?: 'success' | 'error' | 'secondary'
}

let count = 0

function genId() {
	count = (count + 1) % 100
	return count.toString()
}

const KEY = Symbol('toast')

export interface Toast {
	toasts: Ref<ToastOptions[]>
	show: (options: Omit<ToastOptions, 'id'>) => string
	remove: (id: string) => void
}

export function defineToast() {
	const toasts = ref<ToastOptions[]>([])

	const result = {
		toasts,
		show: (options: Omit<ToastOptions, 'id'>) => {
			const id = genId()
			const newToast: ToastOptions = {
				id,
				...options,
			}
			toasts.value.push(newToast)
			return id
		},
		remove: (id: string) => {
			toasts.value = toasts.value.filter(toast => toast.id !== id)
		},
	}
	provideLocal(KEY, result)

	return result
}

export function useToast(): Toast {
	return injectLocal(KEY) as Toast
}
