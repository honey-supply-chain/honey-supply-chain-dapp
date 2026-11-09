import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useChainId, useConnection, useWaitForTransactionReceipt } from 'wagmi'
import { useWriteQualityIndexSubmitOrigin } from '../generated'
import { addresses } from '../addresses'
import { useApiaries } from '../hooks/useApiaries'
import { useBatchComposition } from '../hooks/useBatchComposition'
import { fetchRegionScore, uploadOrigin } from '../simulator'
import { cidToBytes32 } from '../lib/cid'
import { recordStep, recordError, errorMessage } from '../measurements'
import { useTxTiming } from '../hooks/useTxTiming'
import { getFreshNonce } from '../nonce'
import PendingTxOverlay from '../components/PendingTxOverlay'

const REGIONS = [
  { value: 'EU_NON_EU_MIX', label: 'EU- und Nicht-EU-Mix' },
  { value: 'EU_MIX', label: 'EU-Mix' },
  { value: 'NATIONAL', label: 'National' },
  { value: 'REGIONAL_GPS_VERIFIED', label: 'Regional' },
]

function SubmitOrigin() {
  const { batchId } = useParams()
  const chainId = useChainId()
  const { address } = useConnection()
  const qualityIndex = addresses[chainId as keyof typeof addresses]?.QualityIndex
  const { apiaries } = useApiaries()
  const { getComposition } = useBatchComposition()

  const [region, setRegion] = useState(REGIONS[0].value)
  const [phase, setPhase] = useState<'form' | 'waiting' | 'done'>('form')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const offChainMsRef = useRef(0)
  const uploadedCidRef = useRef('')
  const errorRecorded = useRef(false)

  const submitOriginTx = useWriteQualityIndexSubmitOrigin()
  const originReceipt = useWaitForTransactionReceipt({ hash: submitOriginTx.data })
  const originTiming = useTxTiming(submitOriginTx.data)

  const id = batchId ? BigInt(batchId) : undefined
  const composition = batchId ? getComposition(Number(batchId)) : []
  const placeNames = [...new Set(
    composition
      .map((row) => apiaries.find((a) => a.id === row.apiaryId)?.realRegion)
      .filter((name): name is string => Boolean(name)),
  )]

  useEffect(() => {
    if (submitOriginTx.isError && !errorRecorded.current) {
      errorRecorded.current = true
      recordError({
        chainId, batchId: id, step: 'submitOrigin', actor: 'beekeeper', address,
        message: errorMessage(submitOriginTx.error),
      })
      setError(errorMessage(submitOriginTx.error))
      setPhase('form')
    }
  }, [submitOriginTx.isError])

  useEffect(() => {
    if (phase !== 'waiting' || !originReceipt.isSuccess || !originReceipt.data || id === undefined) return
    if (originReceipt.data.status === 'reverted') {
      recordError({
        chainId, batchId: id, step: 'submitOrigin', actor: 'beekeeper', address,
        message: 'Transaktion wurde on-chain zurückgewiesen (reverted).',
      })
      setPhase('done')
      return
    }
    const { walletConfirmMs, miningMs, totalMs } = originTiming.split()
    void recordStep({
      chainId, batchId: id, step: 'submitOrigin', actor: 'beekeeper', address,
      txHash: originReceipt.data.transactionHash, gasUsed: originReceipt.data.gasUsed,
      gasPriceWei: originReceipt.data.effectiveGasPrice,
      durationMs: offChainMsRef.current + totalMs,
      timings: { renderMs: 0, uploadMs: offChainMsRef.current, chainMs: totalMs },
      walletTiming: { walletConfirmMs, miningMs },
      note: uploadedCidRef.current ? `cid=${uploadedCidRef.current}` : '',
    })
    setPhase('done')
  }, [phase, originReceipt.isSuccess])

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    if (!id || !qualityIndex) return
    setError('')
    setIsSubmitting(true)
    const offChainStartedAt = performance.now()
    try {
      const [score, cid] = await Promise.all([fetchRegionScore(region), uploadOrigin(placeNames)])
      offChainMsRef.current = Math.round(performance.now() - offChainStartedAt)
      uploadedCidRef.current = cid
      errorRecorded.current = false
      originTiming.markSubmitted()
      const nonce = await getFreshNonce(address as `0x${string}` | undefined)
      submitOriginTx.mutate({ address: qualityIndex, args: [id, score, cidToBytes32(cid)], nonce })
      setPhase('waiting')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Abfrage der Region oder Hochladen der Herkunft ist fehlgeschlagen.'
      setError(message)
      recordError({ chainId, batchId: id, step: 'submitOrigin', actor: 'beekeeper', address, message })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!batchId) return <p>Lädt...</p>

  if (phase === 'done') {
    return (
      <div>
        <p>Herkunft wurde eingereicht.</p>
        <Link to={`/batches/${batchId}`} className="tile">Zur Charge</Link>
      </div>
    )
  }

  return (
    <div>
      <PendingTxOverlay active={phase === 'waiting'} hash={submitOriginTx.data} />
      <h1>Herkunft einreichen — Charge #{batchId}</h1>

      <p>Beteiligte Orte: {placeNames.length > 0 ? placeNames.join(', ') : 'keine Zusammensetzung gefunden'}</p>

      <form onSubmit={handleSubmit}>
        <label>
          Eignungsstufe
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </label>

        <button type="submit" disabled={isSubmitting || phase !== 'form' || placeNames.length === 0}>
          {isSubmitting || phase !== 'form' ? 'Wird eingereicht...' : 'Herkunft einreichen'}
        </button>
      </form>

      {error && <p>{error}</p>}
    </div>
  )
}

export default SubmitOrigin
