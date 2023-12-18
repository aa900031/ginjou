import type { SaveFunction } from '@ginjou/core'
import type { Ref } from 'vue-demi'

export interface Save<
	TSaveFn extends SaveFunction<any> = SaveFunction<any>,
> {
	isSaving: Ref<boolean>
	save: TSaveFn
}
