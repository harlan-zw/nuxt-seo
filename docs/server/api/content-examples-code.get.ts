import { appendHeader, createError, defineEventHandler } from 'h3'
import { pascalCase } from 'scule'

// @ts-expect-error untyped
import components from '#content-examples-code/nitro'

export default defineEventHandler((event) => {
  appendHeader(event, 'Access-Control-Allow-Origin', '*')
  const componentName = (event.context.params['component?'] || '').replace(/\.json$/, '')
  if (componentName) {
    const component = components[pascalCase(componentName)]
    if (!component) {
      throw createError({
        statusMessage: `Examples not found: ${componentName}!`,
        statusCode: 404,
      })
    }
    return component
  }
})
