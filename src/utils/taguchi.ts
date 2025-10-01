export type SNMode = 'larger' | 'smaller' | 'nominal'

export interface Factor {
  name: string
  label?: string
  levels: number[] // 3-level typical
}

export interface OA {
  name: string
  matrix: number[][] // rows = runs, values = level indices (0-based)
}

// Taguchi L9(3^4) standard OA
export const L9_3_4: OA = {
  name: 'L9(3^4)',
  matrix: [
    [0, 0, 0, 0],
    [0, 1, 1, 1],
    [0, 2, 2, 2],
    [1, 0, 1, 2],
    [1, 1, 2, 0],
    [1, 2, 0, 1],
    [2, 0, 2, 1],
    [2, 1, 0, 2],
    [2, 2, 1, 0],
  ],
}

// Convenience L9(3^3) (first 3 columns of L9(3^4))
export const L9_3_3: OA = {
  name: 'L9(3^3)',
  matrix: L9_3_4.matrix.map(row => row.slice(0, 3)),
}

// 2-level OAs (Taguchi)
export const L4_2_3: OA = {
  name: 'L4(2^3)',
  matrix: [
    [0,0,0],
    [0,1,1],
    [1,0,1],
    [1,1,0],
  ],
}

export const L8_2_7: OA = {
  name: 'L8(2^7)',
  matrix: [
    [0,0,0,0,0,0,0],
    [0,0,0,1,1,1,1],
    [0,1,1,0,0,1,1],
    [0,1,1,1,1,0,0],
    [1,0,1,0,1,0,1],
    [1,0,1,1,0,1,0],
    [1,1,0,0,1,1,0],
    [1,1,0,1,0,0,1],
  ],
}

export const L12_2_11: OA = {
  name: 'L12(2^11)',
  matrix: [
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1],
    [0,0,1,1,0,0,1,1,1,1,0],
    [0,0,1,1,1,1,0,0,0,0,1],
    [0,1,0,1,0,1,0,1,0,1,0],
    [0,1,0,1,1,0,1,0,1,0,1],
    [0,1,1,0,0,1,1,0,1,0,0],
    [0,1,1,0,1,0,0,1,0,1,1],
    [1,0,0,1,0,1,1,0,0,1,0],
    [1,0,0,1,1,0,0,1,1,0,1],
    [1,0,1,0,0,0,0,1,1,0,0],
    [1,0,1,0,1,1,1,0,0,1,1],
  ],
}

export const L16_2_15: OA = {
  name: 'L16(2^15)',
  matrix: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
    [0,0,1,1,1,1,1,0,0,0,0,1,1,1,1],
    [0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,1,0,1,1,0,1,0,1,0,1,0,1,0,1],
    [0,1,0,1,1,0,1,1,0,1,0,1,0,1,0],
    [0,1,1,0,0,1,0,0,1,0,1,1,0,1,1],
    [0,1,1,0,0,1,0,1,0,1,0,0,1,0,0],
    [1,0,0,1,0,1,0,0,1,0,1,0,0,1,0],
    [1,0,0,1,0,1,0,1,0,1,0,0,1,0,1],
    [1,0,1,0,1,0,1,0,0,1,0,1,1,0,0],
    [1,0,1,0,1,0,1,1,1,0,1,0,0,1,1],
    [1,1,0,0,1,1,0,0,0,1,1,0,1,1,0],
    [1,1,0,0,1,1,0,1,1,0,0,1,0,0,1],
    [1,1,1,1,0,0,0,0,0,1,1,1,0,0,1],
    [1,1,1,1,0,0,0,1,1,0,0,0,1,1,0],
  ],
}

// Mixed-level OA: L18(2^1·3^7) — col0 is 2-level, cols 1..7 are 3-level
export const L18_2_1_3_7: OA = {
  name: 'L18(2^1·3^7)',
  matrix: [
    [0,0,0,0,0,0,0,0],
    [0,0,1,2,1,2,1,2],
    [0,0,2,1,2,1,2,1],
    [0,1,0,1,2,2,1,2],
    [0,1,1,2,0,0,2,1],
    [0,1,2,0,1,1,0,0],
    [0,2,0,2,2,1,0,2],
    [0,2,1,0,0,2,1,0],
    [0,2,2,1,1,0,2,1],
    [1,0,0,2,0,1,2,1],
    [1,0,1,0,1,2,0,2],
    [1,0,2,1,2,0,1,0],
    [1,1,0,0,2,0,1,2],
    [1,1,1,1,0,1,2,0],
    [1,1,2,2,1,2,0,1],
    [1,2,0,1,0,2,2,0],
    [1,2,1,2,1,0,0,1],
    [1,2,2,0,2,1,1,2],
  ],
}

export interface OASelectResult {
  oa: OA
  warning?: string
}

export function selectOAForFactors(factors: Factor[]): OASelectResult {
  const n2 = factors.filter(f => f.levels.length === 2).length
  const n3 = factors.filter(f => f.levels.length === 3).length
  if (factors.length === 0) return { oa: { name: 'Empty', matrix: [] } }

  // All 3-levels and up to 4 factors -> L9(3^4)
  if (n3 === factors.length && n3 <= 4) {
    const matrix = L9_3_4.matrix.map(row => row.slice(0, n3))
    return { oa: { name: `L9(3^${n3})`, matrix } }
  }

  // All 2-levels
  if (n2 === factors.length) {
    if (n2 <= 3) {
      const matrix = L4_2_3.matrix.map(row => row.slice(0, n2))
      return { oa: { name: `L4(2^${n2})`, matrix } }
    }
    if (n2 <= 7) {
      const matrix = L8_2_7.matrix.map(row => row.slice(0, n2))
      return { oa: { name: `L8(2^${n2})`, matrix } }
    }
    if (n2 <= 11) {
      const matrix = L12_2_11.matrix.map(row => row.slice(0, n2))
      return { oa: { name: `L12(2^${n2})`, matrix } }
    }
    if (n2 <= 15) {
      const matrix = L16_2_15.matrix.map(row => row.slice(0, n2))
      return { oa: { name: `L16(2^${n2})`, matrix } }
    }
    return { oa: { name: 'L16(2^15)', matrix: L16_2_15.matrix }, warning: '2 seviyeli faktör sayısı 15\'i aşıyor; desteklenmiyor.' }
  }

  // Mixed: use L18(2^1·3^7) if fits (max 1 two-level, max 7 three-level)
  if (n2 <= 1 && n3 <= 7) {
    // Build composed matrix columns in factor order
    const twoCol = L18_2_1_3_7.matrix.map(row => [row[0]])
    const threeCols = [1,2,3,4,5,6,7].map(ci => L18_2_1_3_7.matrix.map(row => row[ci]))
    let threeIdx = 0
    const columns: number[][] = []
    factors.forEach(f => {
      if (f.levels.length === 2) {
        columns.push(twoCol.map(r => r[0]))
      } else {
        const col = threeCols[threeIdx]
        columns.push(col)
        threeIdx++
      }
    })
    // Transpose columns -> runs x k
    const runs = L18_2_1_3_7.matrix.length
    const matrix: number[][] = Array.from({ length: runs }, (_, r) => columns.map(col => col[r]))
    return { oa: { name: `L18(2^${n2}·3^${n3})`, matrix } }
  }

  return { oa: L9_3_3, warning: 'Seçilen faktör/seviye yapısı için basit OA seçimi bulunamadı. L9 varsayılanı kullanıldı.' }
}

export interface RunPlan {
  index: number
  levels: Record<string, number>
}

export function buildDesign(factors: Factor[], oa: OA): RunPlan[] {
  if (factors.length === 0) return []
  const cols = Math.min(factors.length, oa.matrix[0].length)
  return oa.matrix.map((row, r) => {
    const levels: Record<string, number> = {}
    for (let i = 0; i < cols; i++) {
      const f = factors[i]
      const lvlIdx = row[i]
      levels[f.name] = f.levels[lvlIdx]
    }
    return { index: r + 1, levels }
  })
}

// S/N ratios
export function snrLarger(y: number[]): number {
  if (!y || y.length === 0) return 0
  const mean = y.reduce((s, v) => s + 1 / (v * v), 0) / y.length
  return -10 * Math.log10(mean)
}

export function snrSmaller(y: number[]): number {
  if (!y || y.length === 0) return 0
  const mean = y.reduce((s, v) => s + v * v, 0) / y.length
  return -10 * Math.log10(mean)
}

export function snrNominal(y: number[]): number {
  if (!y || y.length < 2) return 0
  const n = y.length
  const mu = y.reduce((s, v) => s + v, 0) / n
  const s2 = y.reduce((s, v) => s + (v - mu) * (v - mu), 0) / (n - 1)
  const ratio = (mu * mu) / (s2 || 1e-12)
  return 10 * Math.log10(ratio)
}

export function snr(y: number[], mode: SNMode): number {
  switch (mode) {
    case 'larger': return snrLarger(y)
    case 'smaller': return snrSmaller(y)
    default: return snrNominal(y)
  }
}

// Calculate factor-level main effects on S/N (mean S/N per level)
export function mainEffects(
  factors: Factor[],
  plan: RunPlan[],
  runSnrs: number[]
): Record<string, number[]> {
  const effects: Record<string, number[]> = {}
  const counts: Record<string, number[]> = {}
  for (const f of factors) {
    effects[f.name] = new Array(f.levels.length).fill(0)
    counts[f.name] = new Array(f.levels.length).fill(0)
  }
  plan.forEach((run, idx) => {
    const s = runSnrs[idx]
    if (s == null || isNaN(s)) return
    for (const f of factors) {
      const val = run.levels[f.name]
      const lvlIdx = f.levels.findIndex(v => v === val)
      if (lvlIdx >= 0) {
        effects[f.name][lvlIdx] += s
        counts[f.name][lvlIdx] += 1
      }
    }
  })
  for (const name in effects) {
    effects[name] = effects[name].map((sum, i) => counts[name][i] > 0 ? sum / counts[name][i] : NaN)
  }
  return effects
}

export function bestLevels(
  factors: Factor[],
  effects: Record<string, number[]>
): Record<string, { levelIndex: number, levelValue: number, snr: number }> {
  const result: Record<string, { levelIndex: number, levelValue: number, snr: number }> = {}
  for (const f of factors) {
    const arr = effects[f.name] || []
    let bestIdx = 0
    let bestVal = -Infinity
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i]
      if (v != null && !isNaN(v) && v > bestVal) {
        bestVal = v
        bestIdx = i
      }
    }
    result[f.name] = { levelIndex: bestIdx, levelValue: f.levels[bestIdx], snr: bestVal }
  }
  return result
}
