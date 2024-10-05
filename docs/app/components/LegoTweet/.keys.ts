import type { InjectionKey, Ref } from 'vue'
import type { Tweet } from './utils'

export default Symbol('twitter-symbol') as InjectionKey<Ref<Tweet>>
