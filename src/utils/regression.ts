export interface RegressionResult {
  coef: number[]
  predict: (x: number[]) => number
  rSquared: number
  rmse: number
  residuals: number[]
  predictions: number[]
  n: number
  yMean: number
}

export function olsFit(X: number[][], y: number[]): RegressionResult {
  if (X.length === 0 || y.length === 0 || X.length !== y.length) {
    return {
      coef: [0, 0],
      predict: () => 0,
      rSquared: 0,
      rmse: 0,
      residuals: [],
      predictions: [],
      n: 0,
      yMean: 0
    }
  }

  try {
    console.log('OLS Fit - Input X shape:', X.length, 'x', X[0]?.length)
    console.log('OLS Fit - Input y shape:', y.length)
    console.log('OLS Fit - Sample X:', X.slice(0, 3))
    console.log('OLS Fit - Sample y:', y.slice(0, 3))

    // Add intercept
    const Xb = X.map((row) => [1, ...row])
    console.log('OLS Fit - Xb shape:', Xb.length, 'x', Xb[0].length)
    
    const Xt = transpose(Xb)
    const XtX = matMul(Xt, Xb)
    console.log('OLS Fit - XtX shape:', XtX.length, 'x', XtX[0].length)
    console.log('OLS Fit - XtX matrix:', XtX)
    
    const XtX_inv = matrixInverse(XtX)
    if (!XtX_inv) {
      console.error('Matrix inversion failed - using simple linear regression')
      return simpleLinearRegression(X, y)
    }
    
    const XtY = matVecMul(Xt, y)
    const coef = matVecMul(XtX_inv, XtY)
    console.log('OLS Fit - Coefficients:', coef)

    function predict(x: number[]) {
      const xx = [1, ...x]
      return dot(coef, xx)
    }

    // Calculate model metrics
    const predictions = X.map(x => predict(x))
    const residuals = y.map((actual, i) => actual - predictions[i])
    
    const yMean = y.reduce((sum, val) => sum + val, 0) / y.length
    const totalSumSquares = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0)
    const residualSumSquares = residuals.reduce((sum, res) => sum + Math.pow(res, 2), 0)
    
    const rSquared = totalSumSquares > 0 ? Math.max(0, 1 - (residualSumSquares / totalSumSquares)) : 0
    const rmse = Math.sqrt(residualSumSquares / Math.max(1, y.length - coef.length))

    console.log('OLS Fit - R²:', rSquared, 'RMSE:', rmse)

    return {
      coef,
      predict,
      rSquared,
      rmse,
      residuals,
      predictions,
      n: y.length,
      yMean
    }
  } catch (error) {
    console.error('OLS regression failed, falling back to simple linear regression:', error)
    return simpleLinearRegression(X, y)
  }
}

// Fallback basit linear regresyon
function simpleLinearRegression(X: number[][], y: number[]): RegressionResult {
  // İlk özelliği kullan
  const x = X.map(row => row[0]).filter(val => !isNaN(val))
  const filteredY = y.filter((_, i) => !isNaN(X[i][0]))
  
  if (x.length < 2) {
    return {
      coef: [0, 0],
      predict: () => 0,
      rSquared: 0,
      rmse: 0,
      residuals: [],
      predictions: [],
      n: 0,
      yMean: 0
    }
  }
  
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = filteredY.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * filteredY[i], 0)
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  const coef = [intercept, slope]
  
  function predict(inputX: number[]) {
    return intercept + slope * inputX[0]
  }
  
  const predictions = x.map(xi => predict([xi]))
  const residuals = filteredY.map((actual, i) => actual - predictions[i])
  const yMean = filteredY.reduce((sum, val) => sum + val, 0) / filteredY.length
  const totalSumSquares = filteredY.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0)
  const residualSumSquares = residuals.reduce((sum, res) => sum + Math.pow(res, 2), 0)
  const rSquared = totalSumSquares > 0 ? Math.max(0, 1 - (residualSumSquares / totalSumSquares)) : 0
  const rmse = Math.sqrt(residualSumSquares / Math.max(1, n - 2))
  
  return {
    coef,
    predict,
    rSquared,
    rmse,
    residuals,
    predictions,
    n: filteredY.length,
    yMean
  }
}

export function multipleRegression(features: string[], X: number[][], y: number[]): RegressionResult {
  return olsFit(X, y)
}

export function crossValidation(X: number[][], y: number[], folds: number = 5) {
  const n = X.length
  const foldSize = Math.floor(n / folds)
  const scores = []
  
  for (let fold = 0; fold < folds; fold++) {
    const testStart = fold * foldSize
    const testEnd = fold === folds - 1 ? n : testStart + foldSize
    
    const trainX = [...X.slice(0, testStart), ...X.slice(testEnd)]
    const trainY = [...y.slice(0, testStart), ...y.slice(testEnd)]
    const testX = X.slice(testStart, testEnd)
    const testY = y.slice(testStart, testEnd)
    
    if (trainX.length < 2 || testX.length === 0) continue
    
    const model = olsFit(trainX, trainY)
    const testPreds = testX.map(x => model.predict(x))
    const mse = testY.reduce((sum, actual, i) => sum + Math.pow(actual - testPreds[i], 2), 0) / testY.length
    scores.push(Math.sqrt(mse))
  }
  
  return {
    cvRMSE: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    cvScores: scores
  }
}

function transpose(A: number[][]) {
  const rows = A.length, cols = A[0].length
  const T: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0))
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) T[j][i] = A[i][j]
  return T
}

function matMul(A: number[][], B: number[][]) {
  const rows = A.length, cols = B[0].length, n = B.length
  const C: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0))
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let s = 0
      for (let k = 0; k < n; k++) s += A[i][k] * B[k][j]
      C[i][j] = s
    }
  }
  return C
}

function matVecMul(A: number[][], x: number[]) {
  return A.map((row) => row.reduce((s, a, i) => s + a * x[i], 0))
}

function dot(a: number[], b: number[]) {
  return a.reduce((s, v, i) => s + v * b[i], 0)
}

// Gaussian elimination ile generic matrix inverse
function matrixInverse(matrix: number[][]): number[][] | null {
  const n = matrix.length
  if (n === 0 || matrix[0].length !== n) {
    console.error('Matrix must be square')
    return null
  }
  
  // Augmented matrix oluştur [A|I]
  const augmented: number[][] = []
  for (let i = 0; i < n; i++) {
    augmented[i] = [...matrix[i]]
    for (let j = 0; j < n; j++) {
      augmented[i].push(i === j ? 1 : 0)
    }
  }
  
  // Gaussian elimination with partial pivoting
  for (let i = 0; i < n; i++) {
    // Pivot seç (en büyük mutlak değer)
    let pivotRow = i
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[pivotRow][i])) {
        pivotRow = k
      }
    }
    
    // Satırları değiştir
    if (pivotRow !== i) {
      [augmented[i], augmented[pivotRow]] = [augmented[pivotRow], augmented[i]]
    }
    
    // Pivot değeri kontrolü
    if (Math.abs(augmented[i][i]) < 1e-14) {
      console.error('Matrix is singular or nearly singular, determinant ≈ 0')
      return null
    }
    
    // Pivot row'u normalize et
    const pivot = augmented[i][i]
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= pivot
    }
    
    // Diğer satırları eliminate et
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i]
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j]
        }
      }
    }
  }
  
  // Inverse matrix'i çıkar
  const inverse: number[][] = []
  for (let i = 0; i < n; i++) {
    inverse[i] = augmented[i].slice(n)
  }
  
  return inverse
}

// Backward compatibility için inv2 wrapper
function inv2(mat: number[][]): number[][] {
  const result = matrixInverse(mat)
  if (!result) {
    // Fallback: identity matrix döndür
    const n = mat.length
    const identity: number[][] = []
    for (let i = 0; i < n; i++) {
      identity[i] = new Array(n).fill(0)
      identity[i][i] = 1
    }
    return identity
  }
  return result
}
