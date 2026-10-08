import assert from 'node:assert/strict'
// This action runs without the consumer's test framework.
// eslint-disable-next-line test/no-import-node-test
import { it } from 'node:test'
import { renderReport } from './report.mjs'

it('does not infer runtime cost from package file inventory', () => {
  const metric = { id: '.:payload', label: 'module · built code files', kind: 'output', size: 100, gzipSize: 50 }
  const report = renderReport(new Map(), new Map([[metric.id, metric]]))
  assert.match(report, /Runtime impact was not measured/)
  assert.match(report, /Package file inventory/)
})

it('marks a failed baseline unavailable instead of classifying everything as new', () => {
  const metric = { id: '.:payload', label: 'module · built code files', kind: 'output', size: 100, gzipSize: 50 }
  const report = renderReport(null, new Map([[metric.id, metric]]))
  assert.match(report, /Baseline unavailable/)
  assert.doesNotMatch(report, /new metric|No notable size changes/)
})

it('does not invent growth when a runtime baseline failed', () => {
  const metric = { id: '.:deployed:server', label: 'module · server (raw)', kind: 'runtime', unit: 'raw', size: 100, gzipSize: 50 }
  const report = renderReport(new Map(), new Map([[metric.id, metric]]))
  assert.match(report, /server \(raw\).+unavailable/)
  assert.doesNotMatch(report, /🆕 new/)
})

it('compares deployed server bytes instead of its gzip size', () => {
  const metric = { id: '.:deployed:server', label: 'module · server (raw)', kind: 'runtime', unit: 'raw', size: 100, gzipSize: 50 }
  const report = renderReport(new Map([[metric.id, metric]]), new Map([[metric.id, { ...metric, size: 200 }]]))
  assert.match(report, /\+100 B.+\+200 B.+\+100 B/)
})
