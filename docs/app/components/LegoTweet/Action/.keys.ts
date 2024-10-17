import type { InjectionKey, Ref } from 'vue'

export const copiedKey = Symbol('TwitterAction') as InjectionKey<Ref<boolean>>
