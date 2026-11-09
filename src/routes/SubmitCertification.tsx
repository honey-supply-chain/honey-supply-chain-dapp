import { useState, type SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import { useChainId, useConnection, usePublicClient } from 'wagmi'
import { useReadActorRegistryCertifications } from '../generated'
import { addresses } from '../addresses'
import { requestCertification } from '../simulator'
import { recordStep, recordError } from '../measurements'
import { useActiveScenario, useCertificationReset } from '../scenario'
import { CERTIFICATION_LABELS } from './BatchDetail'
import { bytes32ToCid } from '../lib/cid'

const OPTIONS = [
  { value: 'NATIONAL_QUALITY_LABEL', label: 'Nationales Gütesiegel' },
  { value: 'EU_ORGANIC', label: 'EU-Bio' },
  { value: 'ASSOCIATION_ORGANIC', label: 'Verbands-Bio' },
]

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/'

function SubmitCertification() {
  const chainId = useChainId()
  const { address } = useConnection()
  const publicClient = usePublicClient()
  const actorRegistry = addresses[chainId as keyof typeof addresses]?.ActorRegistry
  const [requested, setRequested] = useState(OPTIONS[0].value)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState('')
  const { id: scenarioId, scenario } = useActiveScenario()
  const isRealScenario = scenarioId !== 'normal' && scenarioId !== 'entwicklung'
  const force = isRealScenario && requested === scenario.force.certification ? scenario.force.certification : undefined

  const { data: certificationData, refetch: refetchCertification } = useReadActorRegistryCertifications({
    address: actorRegistry,
    args: address ? [address] : undefined,
    query: { enabled: Boolean(actorRegistry && address) },
  })
  const [currentCidHash, currentScore] = certificationData ?? [undefined, 0]
  const currentCid = bytes32ToCid(currentCidHash)
  useCertificationReset(() => {
    void refetchCertification()
    setStatus('idle')
  })

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    if (!address) return
    setStatus('loading')
    try {
      const response = await requestCertification(address, requested, force)
      setResult(response.certification)
      await refetchCertification()
      const receipt = publicClient
        ? await publicClient.getTransactionReceipt({ hash: response.transactionHash as `0x${string}` })
        : undefined
      void recordStep({
        chainId, batchId: undefined, step: 'certification', actor: 'certBody',
        txHash: response.transactionHash, gasUsed: receipt?.gasUsed ?? BigInt(response.gasUsed),
        gasPriceWei: receipt?.effectiveGasPrice,
        durationMs: response.timings.renderMs + response.timings.uploadMs + response.timings.chainMs,
        timings: response.timings, note: response.ipfsCid ? `cid=${response.ipfsCid}` : '',
      })
      setStatus('done')
    } catch (err) {
      setStatus('error')
      recordError({
        chainId, batchId: undefined, step: 'certification', actor: 'certBody',
        message: err instanceof Error ? err.message : 'Zertifizierungs-Anfrage fehlgeschlagen.',
      })
    }
  }

  if (status === 'done') {
    const label = OPTIONS.find((o) => o.value === requested)?.label
    return (
      <div>
        <p>
          {result === requested
            ? `Zertifikat erhalten: ${label}`
            : `Die Kriterien für "${label}" wurden nicht erfüllt — kein Zertifikat erhalten.`}
        </p>
        <Link to="/dashboard" className="tile">Zum Dashboard</Link>
      </div>
    )
  }

  return (
    <div>
      <h1>Zertifikat beantragen</h1>
      <p>
        Aktuelles Zertifikat: {CERTIFICATION_LABELS[currentScore] ?? 'unbekannt'}
        {currentCid && (
          <>
            {' '}— <a href={IPFS_GATEWAY + currentCid} target="_blank" rel="noreferrer">ansehen</a>
          </>
        )}
      </p>
      <form onSubmit={handleSubmit}>
        <label>
          Zertifikat
          <select value={requested} onChange={(e) => setRequested(e.target.value)}>
            {OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'wird beantragt...' : 'Beantragen'}
        </button>
      </form>
      {status === 'error' && <p>Zertifizierung beantragen fehlgeschlagen.</p>}
    </div>
  )
}

export default SubmitCertification
