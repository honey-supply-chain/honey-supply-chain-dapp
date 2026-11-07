import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useChainId, useConnection, useWaitForTransactionReceipt } from 'wagmi'
import { useWriteQualityIndexSubmitMciOriginData, useWriteQualityIndexSubmitOrigin } from '../generated'
import { addresses } from '../addresses'
import { useApiaries } from '../hooks/useApiaries'
import { useBatchComposition } from '../hooks/useBatchComposition'
import { fetchRegionScore, uploadOrigin } from '../simulator'
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
  const [phase, setPhase] = useState<'form' | 'waitingRegion' | 'waitingOrigin' | 'retryOrigin' | 'done'>('form')
  const [error, setError] = useState('')
  const uploadMsRef = useRef(0)
  const uploadedCidRef = useRef('')
  const regionErrorRecorded = useRef(false)
  const originErrorRecorded = useRef(false)
  // Schützt vor React StrictMode, das Effekte im Dev-Modus absichtlich doppelt ausführt: Ohne diese
  // Sperre würde der Effekt unten `submitOriginTx.mutate(...)` zweimal auslösen — die zweite
  // Transaktion kommt dann mit einer bereits verbrauchten Nonce beim Wallet an ("Nonce too low").
  const originUploadTriggered = useRef(false)

  const submitRegion = useWriteQualityIndexSubmitMciOriginData()
  const regionReceipt = useWaitForTransactionReceipt({ hash: submitRegion.data })
  const regionTiming = useTxTiming(submitRegion.data)
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
    if (submitRegion.isError && !regionErrorRecorded.current) {
      regionErrorRecorded.current = true
      recordError({
        chainId, batchId: id, step: 'submitMCIOriginData', actor: 'beekeeper', address,
        message: errorMessage(submitRegion.error),
      })
      // Sonst bleibt der Button für immer bei "Wird eingereicht..." hängen — zurück zum Formular,
      // damit ohne Neuladen der Seite ein neuer Versuch möglich ist.
      setError(errorMessage(submitRegion.error))
      setPhase('form')
    }
  }, [submitRegion.isError])

  useEffect(() => {
    if (submitOriginTx.isError && !originErrorRecorded.current) {
      originErrorRecorded.current = true
      recordError({
        chainId, batchId: id, step: 'submitOrigin', actor: 'beekeeper', address,
        message: errorMessage(submitOriginTx.error),
      })
      // Schritt 1 (Eignungsstufe) ist zu diesem Zeitpunkt schon auf der Chain — zurück zum Formular
      // würde ihn nochmal einreichen. Stattdessen bei "waitingOrigin" stehen bleiben, aber den Button
      // wieder freigeben, damit die zweite Transaktion erneut versucht werden kann.
      setError(errorMessage(submitOriginTx.error))
      setPhase('retryOrigin')
    }
  }, [submitOriginTx.isError])

  useEffect(() => {
    if (phase !== 'waitingRegion' || !regionReceipt.isSuccess || !regionReceipt.data || !id || !qualityIndex) return
    if (originUploadTriggered.current) return
    originUploadTriggered.current = true
    if (regionReceipt.data.status === 'reverted') {
      recordError({
        chainId, batchId: id, step: 'submitMCIOriginData', actor: 'beekeeper', address,
        message: 'Transaktion wurde on-chain zurückgewiesen (reverted).',
      })
      return
    }
    const { walletConfirmMs, miningMs, totalMs } = regionTiming.split()
    void recordStep({
      chainId, batchId: id, step: 'submitMCIOriginData', actor: 'beekeeper', address,
      txHash: regionReceipt.data.transactionHash, gasUsed: regionReceipt.data.gasUsed,
      gasPriceWei: regionReceipt.data.effectiveGasPrice,
      durationMs: totalMs, walletTiming: { walletConfirmMs, miningMs },
    })
    const uploadStartedAt = performance.now()
    uploadOrigin(placeNames)
      .then(async (cid) => {
        uploadMsRef.current = Math.round(performance.now() - uploadStartedAt)
        uploadedCidRef.current = cid
        originErrorRecorded.current = false
        originTiming.markSubmitted()
        const nonce = await getFreshNonce(address as `0x${string}` | undefined)
        submitOriginTx.mutate({ address: qualityIndex, args: [id, cid], nonce })
        setPhase('waitingOrigin')
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Hochladen der Herkunft ist fehlgeschlagen.'
        setError(message)
        recordError({ chainId, batchId: id, step: 'submitOrigin', actor: 'beekeeper', address, message })
      })
  }, [phase, regionReceipt.isSuccess])

  useEffect(() => {
    if (phase !== 'waitingOrigin' || !originReceipt.isSuccess || !originReceipt.data) return
    if (id !== undefined) {
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
        durationMs: uploadMsRef.current + totalMs,
        timings: { renderMs: 0, uploadMs: uploadMsRef.current, chainMs: totalMs },
        walletTiming: { walletConfirmMs, miningMs },
        note: uploadedCidRef.current ? `cid=${uploadedCidRef.current}` : '',
      })
    }
    setPhase('done')
  }, [phase, originReceipt.isSuccess])

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    if (!id || !qualityIndex) return
    setError('')
    try {
      const score = await fetchRegionScore(region)
      regionErrorRecorded.current = false
      originUploadTriggered.current = false
      regionTiming.markSubmitted()
      const nonce = await getFreshNonce(address as `0x${string}` | undefined)
      submitRegion.mutate({ address: qualityIndex, args: [id, score], nonce })
      setPhase('waitingRegion')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Abfrage der Region beim Simulator ist fehlgeschlagen.'
      setError(message)
      recordError({ chainId, batchId: id, step: 'submitMCIOriginData', actor: 'beekeeper', address, message })
    }
  }

  // Schritt 1 ist schon auf der Chain, der CID-Upload ist schon passiert — nur die zweite
  // Transaktion nochmal mit einer frisch vom Node geholten Nonce abschicken.
  async function handleRetryOrigin() {
    if (!id || !qualityIndex || !uploadedCidRef.current) return
    setError('')
    originErrorRecorded.current = false
    originTiming.markSubmitted()
    const nonce = await getFreshNonce(address as `0x${string}` | undefined)
    submitOriginTx.mutate({ address: qualityIndex, args: [id, uploadedCidRef.current], nonce })
    setPhase('waitingOrigin')
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

  if (phase === 'retryOrigin') {
    return (
      <div>
        <h1>Herkunft einreichen — Charge #{batchId}</h1>
        <p>Die Eignungsstufe wurde bereits eingereicht. Das Hochladen der Herkunftsangabe ist fehlgeschlagen.</p>
        {error && <p>{error}</p>}
        <button type="button" onClick={handleRetryOrigin}>Erneut versuchen</button>
      </div>
    )
  }

  return (
    <div>
      <PendingTxOverlay
        active={phase === 'waitingRegion' || phase === 'waitingOrigin'}
        hash={phase === 'waitingRegion' ? submitRegion.data : submitOriginTx.data}
      />
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

        <button type="submit" disabled={phase !== 'form' || placeNames.length === 0}>
          {phase === 'form' ? 'Herkunft einreichen' : 'Wird eingereicht...'}
        </button>
      </form>

      {error && <p>{error}</p>}
    </div>
  )
}

export default SubmitOrigin
