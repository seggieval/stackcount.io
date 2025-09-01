// lib/analysis/enrichMetrics.ts
import { ComputedMetrics } from "./computeMetrics"

export type Enriched = ComputedMetrics & {
  wow: { // week over week
    profit7d: number
    prevProfit7d: number
    delta: number
    pct: number
  }
  trend: {
    slope: number // simple linear slope of daily profit
    volatility: number // stddev of daily profit
    maxDrawdown: number // max cumulative dip
  }
  topDeltaDays: Array<{ date: string; profit: number; deltaFromAvg: number }>
}

export function enrich(m: ComputedMetrics): Enriched {
  const last7 = m.byDay.slice(-7)
  const prev7 = m.byDay.slice(-14, -7)
  const sum = (a: number, b: number) => a + b
  const profit7d = last7.map(d => d.profit).reduce(sum, 0)
  const prevProfit7d = prev7.map(d => d.profit).reduce(sum, 0)
  const delta = profit7d - prevProfit7d
  const pct = prevProfit7d !== 0 ? (delta / Math.abs(prevProfit7d)) * 100 : 0

  const xs = m.byDay.map((_, i) => i)
  const ys = m.byDay.map(d => d.profit)
  const n = ys.length || 1
  const meanX = xs.reduce(sum, 0) / n
  const meanY = ys.reduce(sum, 0) / n
  const slope = xs.reduce((acc, x, i) => acc + (x - meanX) * (ys[i] - meanY), 0) /
    xs.reduce((acc, x) => acc + (x - meanX) ** 2, 1)

  const variance = ys.reduce((acc, v) => acc + (v - meanY) ** 2, 0) / Math.max(n - 1, 1)
  const volatility = Math.sqrt(variance)

  // max drawdown on cumulative profit
  let peak = 0, trough = 0, maxDD = 0, cum = 0
  for (const v of ys) {
    cum += v
    if (cum > peak) { peak = cum; trough = cum }
    if (cum < trough) { trough = cum; maxDD = Math.max(maxDD, peak - trough) }
  }

  const avg = meanY
  const topDeltaDays = [...m.byDay]
    .map(d => ({ ...d, deltaFromAvg: d.profit - avg }))
    .sort((a, b) => Math.abs(b.deltaFromAvg) - Math.abs(a.deltaFromAvg))
    .slice(0, 5)

  return {
    ...m,
    wow: { profit7d, prevProfit7d, delta, pct: Number(pct.toFixed(2)) },
    trend: { slope: Number(slope.toFixed(4)), volatility: Number(volatility.toFixed(2)), maxDrawdown: Number(maxDD.toFixed(2)) },
    topDeltaDays,
  }
}
