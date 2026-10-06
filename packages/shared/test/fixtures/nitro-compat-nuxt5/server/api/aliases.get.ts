import { defineEventHandler } from 'nuxt/server'
import { getAliasGreeting } from '#fixture/server'
import { formatAliasLabel } from '#fixture/server/greeting'
import { getAliasGreeting as getStandaloneGreeting } from '#standalone-fixture/server'

export default defineEventHandler(event => ({ message: formatAliasLabel(getAliasGreeting(event)), standalone: getStandaloneGreeting(event) }))
