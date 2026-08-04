import { defineEventHandler, getRequestHeader } from '#nuxtseo/h3'

export default defineEventHandler(event => ({
  requestHeader: getRequestHeader(event, 'x-nuxtseo-test'),
}))
