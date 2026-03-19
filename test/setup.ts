import { toMatchImageSnapshot } from 'jest-image-snapshot'
import { expect } from 'vitest'

expect.extend({ toMatchImageSnapshot })
