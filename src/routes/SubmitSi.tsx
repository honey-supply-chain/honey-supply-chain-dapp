import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useChainId, useConnection, useWaitForTransactionReceipt } from 'wagmi'
import { useWriteQualityIndexSubmitSiData } from '../generated'
import { addresses } from '../addresses'
import { useApiaries } from '../hooks/useApiaries'
import { useBatchComposition } from '../hooks/useBatchComposition'
import { fetchSiScores, type SiScores } from '../simulator'
import { recordStep, recordError, errorMessage } from '../measurements'
import { useTxTiming } from '../hooks/useTxTiming'
import { getFreshNonce } from '../nonce'
import PendingTxOverlay from '../components/PendingTxOverlay'

const FIELDS = [
  'forage', 'lightIntensity', 'waterSource', 'summerTemperature',
  'winterTemperature', 'windSpeed', 'humidity', 'precipitation',
] as const

function weightedAverage(entries: { scores: SiScores; grams: number }[]): SiScores {
  const totalGrams = entries.reduce((sum, e) => sum + e.grams, 0)
  const result = {} as SiScores
  for (const field of FIELDS) {
    const weightedSum = entries.reduce((sum, e) => sum + e.scores[field] * e.grams, 0)
    result[field] = Math.round(weightedSum / totalGrams)
  }
  return result
}

function SubmitSi() {
  const { batchId } = useParams()
  const chainId = useChainId()
  const { address } = useConnection()
  const qualityIndex = addresses[chainId as keyof typeof addresses]?.QualityIndex
  const { apiaries } = useApiaries()
  const { getComposition } = useBatchComposition()

  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState('')
  const errorRecorded = useRef(false)

  const submitSi = useWriteQualityIndexSubmitSiData()
  const receipt = useWaitForTransactionReceipt({ hash: submitSi.data })
  const timing = useTxTiming(submitSi.data)

  const id = batchId ? BigInt(batchId) : undefined
  const composition = batchId ? getComposition(Number(batchId)) : []

  useEffect(() => {
    if (submitSi.isError && !errorRecorded.current) {
      errorRecorded.current = true
      recordError({
        chainId, batchId: id, step: 'submitSIData', actor: 'beekeeper', address,
        message: errorMessage(submitSi.error),
      })
    }
  }, [submitSi.isError])

  useEffect(() => {
    if (!receipt.isSuccess || !receipt.data || id === undefined) return
    if (receipt.data.status === 'reverted') {
      recordError({
        chainId, batchId: id, step: 'submitSIData', actor: 'beekeeper', address,
        message: 'Transaktion wurde on-chain zurückgewiesen (reverted).',
      })
      return
    }
    const { walletConfirmMs, miningMs, totalMs } = timing.split()
    void recordStep({
      chainId, batchId: id, step: 'submitSIData', actor: 'beekeeper', address,
      txHash: receipt.data.transactionHash, gasUsed: receipt.data.gasUsed, gasPriceWei: receipt.data.effectiveGasPrice,
      durationMs: totalMs, walletTiming: { walletConfirmMs, miningMs },
    })
  }, [receipt.isSuccess])

  async function handleSubmit() {
    if (!id || !qualityIndex) return
    setIsCalculating(true)
    setError('')
    try {
      const entries = await Promise.all(
        composition.map(async (row) => {
          const apiary = apiaries.find((a) => a.id === row.apiaryId)
          if (!apiary) throw new Error(`Bienenstand #${row.apiaryId} nicht gefunden.`)
          const scores = await fetchSiScores(apiary.station, apiary.waterSourceDistanceMeters)
          return { scores, grams: row.grams }
        }),
      )
      errorRecorded.current = false
      timing.markSubmitted()
      const nonce = await getFreshNonce(address as `0x${string}` | undefined)
      submitSi.mutate({ address: qualityIndex, args: [id, weightedAverage(entries)], nonce })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'SI-Berechnung fehlgeschlagen.'
      setError(message)
      recordError({ chainId, batchId: id, step: 'submitSIData', actor: 'beekeeper', address, message })
    } finally {
      setIsCalculating(false)
    }
  }

  if (!batchId) return <p>Lädt...</p>

  if (receipt.isSuccess) {
    return (
      <div>
        <p>SI wurde eingereicht.</p>
        <Link to={`/batches/${batchId}`} className="tile">Zur Charge</Link>
      </div>
    )
  }

  return (
    <div>
      <PendingTxOverlay active={submitSi.isPending || receipt.isLoading} hash={submitSi.data} />
      <h1>Standortdaten einreichen — Charge #{batchId}</h1>

      <p>
        Beteiligte Bienenstände:{' '}
        {composition.length > 0
          ? composition.map((row) => apiaries.find((a) => a.id === row.apiaryId)?.name ?? `#${row.apiaryId}`).join(', ')
          : 'keine Zusammensetzung gefunden'}
      </p>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={composition.length === 0 || isCalculating || submitSi.isPending || receipt.isLoading}
      >
        {isCalculating || submitSi.isPending || receipt.isLoading ? 'Wird eingereicht...' : 'Standortdaten einreichen'}
      </button>

      {error && <p>{error}</p>}
    </div>
  )
}

export default SubmitSi
