import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useChainId, useConnection, usePublicClient } from 'wagmi'
import {
  useReadProductGatewayGetBatchData,
  useReadProductGatewayGetPrice,
  useReadProductGatewayGetQualityData,
  useReadQualityIndexPhqiReportCid,
  useReadQualityIndexAwardCertificateCid,
  useReadQualityIndexMciData,
  useReadActorRegistryCertifications,
  useReadHoneyTokenProcessedBatches,
  useReadSupplyChainRetailReceiptTimestamp,
  useWriteSupplyChainRecordTransportData,
  useWriteSupplyChainRecordWarehouseData,
  useWriteSupplyChainRecordRetailReceipt,
  qualityIndexAbi,
} from '../generated'
import { addresses } from '../addresses'
import ActorLabel from '../components/ActorLabel'
import {
  requestLabAnalysis, requestAward, fetchSensorReading,
  type SensorReading, type SensorForce, type LabForce, type AwardForce, type LabReportData,
} from '../simulator'
import { useRequestedAwards } from '../hooks/useRequestedAwards'
import { useMyRoles } from '../hooks/useMyRoles'
import { useJarCount } from '../hooks/useJarCount'
import { useOriginPlaces } from '../hooks/useOriginPlaces'
import { recordStep, recordError, roleLabel, errorMessage } from '../measurements'
import { useTxTiming } from '../hooks/useTxTiming'
import { getFreshNonce } from '../nonce'
import { useActiveScenario } from '../scenario'
import PendingTxOverlay from '../components/PendingTxOverlay'
import InfoPopover from '../components/InfoPopover'

export const REASON_LABELS: Record<number, string> = {
  1: 'Wassergehalt überschritten',
  2: 'Kühlkettenverletzung',
}
export const CERTIFICATION_LABELS: Record<number, string> = {
  0: 'Keine Zertifizierung',
  2500: 'Nationales Gütesiegel',
  5000: 'EU-Bio',
  10000: 'Verbands-Bio',
}
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/'

export const SI_INFO = 'Bewertet die Umweltbedingungen an den Bienenständen, aus denen die Charge stammt. Setzt sich zusammen aus Tracht (37,41 %), Lichtintensität (17,15 %), Wasserquelle (14,88 %), Sommertemperatur (11,20 %), Wintertemperatur (7,89 %), Windgeschwindigkeit (5,26 %), Luftfeuchtigkeit (3,64 %) und Niederschlag (2,56 %).'
export const PHQI_INFO = 'Bewertet die Laborwerte der Charge: Wassergehalt, HMF-Gehalt und Invertase-Aktivität, je zu einem Drittel gewichtet. Überschreitet der Wassergehalt 23 %, wird die Charge automatisch gesperrt (PHQI = 0). Transport-, Lager- und Auftau-Meldungen verändern den PHQI nicht direkt, können aber bei einer Grenzwertverletzung eine Sperre auslösen, die eine neue Laboranalyse (Nachprüfung) erfordert.'
export const MCI_INFO = 'Bewertet Vertrauens- und Marktmerkmale der Charge: Sorte (19,24 %), Herkunft (46,68 %), Zertifikat (16,18 %) und Prämierung (17,90 %). Die Sorte wird nicht gesondert eingegeben, sondern von der Laboranalyse (PHQI) mit übernommen.'
export const QI_INFO = 'Fasst die drei Teilindizes zum Gesamtwert zusammen, der den Preis bestimmt: QI = PHQI × 53,90 % + MCI × 29,72 % + SI × 16,38 %.'

function labReportStorageKey(batchId: bigint): string {
  return `labReport:${batchId.toString()}`
}

function loadLastReportData(batchId: bigint): LabReportData | undefined {
  try {
    const raw = sessionStorage.getItem(labReportStorageKey(batchId))
    return raw ? (JSON.parse(raw) as LabReportData) : undefined
  } catch {
    return undefined
  }
}

function saveLastReportData(batchId: bigint, data: LabReportData): void {
  try {
    sessionStorage.setItem(labReportStorageKey(batchId), JSON.stringify(data))
  } catch {
  }
}

function BatchDetail() {
  const { batchId } = useParams()
  const chainId = useChainId()
  const { address } = useConnection()
  const productGateway = addresses[chainId as keyof typeof addresses]?.ProductGateway
  const qualityIndex = addresses[chainId as keyof typeof addresses]?.QualityIndex
  const actorRegistry = addresses[chainId as keyof typeof addresses]?.ActorRegistry
  const supplyChain = addresses[chainId as keyof typeof addresses]?.SupplyChain
  const honeyToken = addresses[chainId as keyof typeof addresses]?.HoneyToken
  const id = batchId ? BigInt(batchId) : undefined
  const enabled = Boolean(productGateway && id !== undefined)
  const roles = useMyRoles()

  const { data: processed } = useReadHoneyTokenProcessedBatches({
    address: honeyToken,
    args: id !== undefined ? [id] : undefined,
    query: { enabled: Boolean(honeyToken && id !== undefined) },
  })
  const { data: retailReceiptTimestamp, refetch: refetchRetailReceiptTimestamp } = useReadSupplyChainRetailReceiptTimestamp({
    address: supplyChain,
    args: id !== undefined ? [id] : undefined,
    query: { enabled: Boolean(supplyChain && id !== undefined) },
  })
  const confirmRetailReceipt = useWriteSupplyChainRecordRetailReceipt()
  const retailReceiptTiming = useTxTiming(confirmRetailReceipt.data)
  const publicClient = usePublicClient()
  const [retailReceiptStatus, setRetailReceiptStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  async function handleConfirmRetailReceipt() {
    if (!id || !supplyChain) return
    setRetailReceiptStatus('loading')
    retailReceiptTiming.markSubmitted()
    try {
      const nonce = await getFreshNonce(address as `0x${string}` | undefined)
      const hash = await confirmRetailReceipt.mutateAsync({ address: supplyChain, args: [id], nonce })
      const receipt = publicClient ? await publicClient.waitForTransactionReceipt({ hash }) : undefined
      refetchRetailReceiptTimestamp()
      if (receipt?.status === 'reverted') {
        recordError({
          chainId, batchId: id, step: 'recordRetailReceipt', actor: 'retailer', address,
          message: 'Transaktion wurde on-chain zurückgewiesen (reverted).',
        })
        setRetailReceiptStatus('error')
        return
      }
      const { walletConfirmMs, miningMs, totalMs } = retailReceiptTiming.split()
      void recordStep({
        chainId, batchId: id, step: 'recordRetailReceipt', actor: 'retailer', address,
        txHash: hash, gasUsed: receipt?.gasUsed ?? 0n,
        gasPriceWei: receipt?.effectiveGasPrice,
        durationMs: totalMs, walletTiming: { walletConfirmMs, miningMs },
      })
      setRetailReceiptStatus('idle')
    } catch (err) {
      setRetailReceiptStatus('error')
      recordError({
        chainId, batchId: id, step: 'recordRetailReceipt', actor: 'retailer', address,
        message: errorMessage(err),
      })
    }
  }

  const { data: batchData } = useReadProductGatewayGetBatchData({
    address: productGateway,
    args: id !== undefined ? [id] : undefined,
    query: { enabled },
  })
  const { data: qualityData, refetch: refetchQualityData } = useReadProductGatewayGetQualityData({
    address: productGateway,
    args: id !== undefined ? [id] : undefined,
    query: { enabled },
  })
  const priceQuery = useReadProductGatewayGetPrice({
    address: productGateway,
    args: id !== undefined ? [id, 500] : undefined,
    query: { enabled },
  })
  const jarCount = useJarCount(id, batchData?.[1])
  const originPlaces = useOriginPlaces(id)
  const { data: mciData } = useReadQualityIndexMciData({
    address: qualityIndex,
    args: id !== undefined ? [id] : undefined,
    query: { enabled: Boolean(qualityIndex && id !== undefined) },
  })
  const organicScore = mciData?.[2]

  if (!batchData || !qualityData) {
    return <p>Lädt...</p>
  }

  const [batch, holder] = batchData
  const [si, phqi, mci, qi, state, reason] = qualityData
  const siFraction = Number(si) / 10000
  const phqiFraction = Number(phqi) / 10000
  const mciFraction = Number(mci) / 10000
  const qiFraction = Number(qi) / 10000
  const isBeekeeperOfThisBatch = address?.toLowerCase() === batch.beekeeper.toLowerCase()
  const isCurrentHolder = address?.toLowerCase() === holder.toLowerCase()
  const canBottle = roles.bottler && isCurrentHolder && !processed
  const canConfirmRetailReceipt = roles.retailer && isCurrentHolder && !retailReceiptTimestamp
  const hasAnyAction = isBeekeeperOfThisBatch || isCurrentHolder
  const canRequestLab = isBeekeeperOfThisBatch || (isCurrentHolder && state === 1)
  const blockReason =
    state === 1 ? 'Erst wieder möglich, sobald die Laboranalyse nach der Temperaturverletzung bestätigt wurde.'
      : state === 2 ? 'Nicht möglich: Die Charge ist dauerhaft nicht verkäuflich.'
      : null
  const retailBlockReason = blockReason ?? (!processed ? 'Erst möglich, sobald die Charge abgefüllt wurde.' : null)
  const reasonLabel = REASON_LABELS[reason] ?? 'unbekannter Grund'
  const statusMessage =
    state === 1
      ? {
          kind: 'warning',
          text: `Charge gesperrt – Nachprüfung erforderlich (${reasonLabel}).${canRequestLab ? ' Um die Sperre aufzuheben, fordere im Abschnitt „PHQI" eine erneute Laboranalyse an.' : ''}`,
        }
      : state === 2
        ? { kind: 'warning', text: `Nicht verkaufsfähig (${reasonLabel})` }
        : null

  return (
    <div>
      <PendingTxOverlay active={retailReceiptStatus === 'loading'} hash={confirmRetailReceipt.data} />
      <h1>Charge #{batchId}</h1>

      <h2>Grunddaten</h2>
      <p>Erntejahr: {batch.harvestYear}</p>
      <p>Imker: <ActorLabel address={batch.beekeeper} /></p>
      <p>Menge: {(Number(batch.quantity) / 1000).toFixed(1)} kg</p>
      <p>Aktueller Halter: <ActorLabel address={holder} /></p>
      <p>Herkunft: {originPlaces ? (originPlaces.length > 0 ? originPlaces.join(', ') : 'noch nicht eingetragen') : '...'}</p>
      <p>
        Zertifiziert:{' '}
        {originPlaces === undefined
          ? 'noch nicht erfasst'
          : organicScore !== undefined
            ? CERTIFICATION_LABELS[organicScore] ?? 'unbekannt'
            : '...'}
      </p>
      {statusMessage && <p className={`status-banner ${statusMessage.kind}`}>{statusMessage.text}</p>}

      <h2>Standort-Index (SI)<InfoPopover text={SI_INFO} /></h2>
      <p>Wert: {siFraction.toFixed(4)}</p>
      {isBeekeeperOfThisBatch && (
        <p>
          <Link to={`/batches/${batchId}/si`} className="tile">Standortdaten einreichen</Link>
        </p>
      )}

      <h2>Physikalisch-chemischer Honigqualitätsindex (PHQI)<InfoPopover text={PHQI_INFO} /></h2>
      <p>Wert: {phqiFraction.toFixed(4)}</p>
      {isCurrentHolder && (
        <HandlingActions batchId={id} supplyChain={supplyChain} onReported={refetchQualityData} />
      )}
      <LabDocuments
        batchId={id}
        qualityIndex={qualityIndex}
        canRequestLab={canRequestLab}
        onQualityChanged={refetchQualityData}
        state={state}
      />

      <h2>Marktbezogener Charakterisierungsindex (MCI)<InfoPopover text={MCI_INFO} /></h2>
      <p>Wert: {mciFraction.toFixed(4)}</p>
      {isBeekeeperOfThisBatch && (
        <p>
          <Link to={`/batches/${batchId}/origin`} className="tile">Herkunft einreichen</Link>
        </p>
      )}
      <AwardDocuments
        batchId={id}
        qualityIndex={qualityIndex}
        isBeekeeperOfThisBatch={isBeekeeperOfThisBatch}
        onQualityChanged={refetchQualityData}
      />
      <CertificateDocument beekeeper={batch.beekeeper} actorRegistry={actorRegistry} organicScore={organicScore} />

      <h2>Qualitätsindex (QI)<InfoPopover text={QI_INFO} /></h2>
      <p>Wert: {qiFraction.toFixed(4)}</p>

      <h2>Status</h2>
      <p>Abfüllstatus: {processed ? 'abgefüllt' : 'noch nicht abgefüllt'}</p>
      <p>Abgefüllte Gläser (500 g): {jarCount !== undefined ? jarCount.toString() : '...'}</p>
      <p>
        Wareneingang:{' '}
        {retailReceiptTimestamp
          ? new Date(Number(retailReceiptTimestamp) * 1000).toLocaleString()
          : 'noch nicht bestätigt'}
      </p>
      <p>
        Preis (500 g):{' '}
        {priceQuery.isError
          ? 'nicht verkäuflich'
          : priceQuery.data !== undefined
            ? `${(Number(priceQuery.data) / 100).toFixed(2)} €`
            : '...'}
      </p>
      <p>
        <Link to={`/product/${batchId}`} state={{ fromApp: true }} className="tile">Produktansicht öffnen</Link>
      </p>

      {hasAnyAction && (
        <>
          <h2>Aktionen</h2>
          <p>
            {isCurrentHolder && (
              blockReason ? (
                <span className="tile-disabled" title={blockReason}>
                  Charge übergeben
                </span>
              ) : (
                <Link to={`/batches/${batchId}/transfer`} className="tile">Charge übergeben</Link>
              )
            )}
            {canBottle && (
              blockReason ? (
                <span className="tile-disabled" title={blockReason}>
                  Abfüllen
                </span>
              ) : (
                <Link to={`/batches/${batchId}/bottle`} className="tile">Abfüllen</Link>
              )
            )}
          </p>
          {canConfirmRetailReceipt && (
            retailBlockReason ? (
              <p>
                <span className="tile-disabled" title={retailBlockReason}>
                  Wareneingang bestätigen
                </span>
              </p>
            ) : (
              <>
                <p>
                  <button
                    type="button"
                    onClick={handleConfirmRetailReceipt}
                    disabled={retailReceiptStatus === 'loading'}
                  >
                    {retailReceiptStatus === 'loading' ? 'wird bestätigt...' : 'Wareneingang bestätigen'}
                  </button>
                </p>
                {retailReceiptStatus === 'error' && <p>Wareneingang bestätigen fehlgeschlagen.</p>}
              </>
            )
          )}
        </>
      )}
    </div>
  )
}

function HandlingActions({
  batchId,
  supplyChain,
  onReported,
}: {
  batchId: bigint | undefined
  supplyChain: `0x${string}` | undefined
  onReported: () => void
}) {
  const chainId = useChainId()
  const { address } = useConnection()
  const publicClient = usePublicClient()
  const roles = useMyRoles()
  const { isDev, scenario } = useActiveScenario()
  const recordTransport = useWriteSupplyChainRecordTransportData()
  const transportTiming = useTxTiming(recordTransport.data)
  const recordWarehouse = useWriteSupplyChainRecordWarehouseData()
  const warehouseTiming = useTxTiming(recordWarehouse.data)
  const recordDefrost = useWriteSupplyChainRecordWarehouseData()
  const defrostTiming = useTxTiming(recordDefrost.data)

  const [transportStatus, setTransportStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [transportResult, setTransportResult] = useState<SensorReading | null>(null)
  const [transportForce, setTransportForce] = useState<SensorForce | ''>('')
  const [warehouseStatus, setWarehouseStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [warehouseResult, setWarehouseResult] = useState<SensorReading | null>(null)
  const [warehouseForce, setWarehouseForce] = useState<SensorForce | ''>('')
  const [defrostStatus, setDefrostStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [defrostResult, setDefrostResult] = useState<SensorReading | null>(null)
  const [defrostForce, setDefrostForce] = useState<SensorForce | ''>('')

  async function handleTransport() {
    if (batchId === undefined || !supplyChain) return
    setTransportStatus('loading')
    try {
      const reading = await fetchSensorReading('transport', isDev ? (transportForce || undefined) : scenario.force.transport)
      setTransportResult(reading)
      transportTiming.markSubmitted()
      const nonce = await getFreshNonce(address as `0x${string}` | undefined)
      const hash = await recordTransport.mutateAsync({
        address: supplyChain,
        args: [batchId, BigInt(reading.temperatureCelsius), BigInt(reading.durationMinutes)],
        nonce,
      })
      const receipt = publicClient ? await publicClient.waitForTransactionReceipt({ hash }) : undefined
      onReported()
      if (receipt?.status === 'reverted') {
        recordError({
          chainId, batchId, step: 'recordTransportData', actor: roleLabel(roles), address,
          message: 'Transaktion wurde on-chain zurückgewiesen (reverted).',
        })
        setTransportStatus('error')
        return
      }
      const { walletConfirmMs, miningMs, totalMs } = transportTiming.split()
      void recordStep({
        chainId, batchId, step: 'recordTransportData', actor: roleLabel(roles), address,
        txHash: hash, gasUsed: receipt?.gasUsed ?? 0n,
        gasPriceWei: receipt?.effectiveGasPrice,
        durationMs: totalMs, walletTiming: { walletConfirmMs, miningMs },
      })
      setTransportStatus('idle')
    } catch (err) {
      setTransportStatus('error')
      recordError({
        chainId, batchId, step: 'recordTransportData', actor: roleLabel(roles), address,
        message: errorMessage(err),
      })
    }
  }

  async function handleWarehouse() {
    if (batchId === undefined || !supplyChain) return
    setWarehouseStatus('loading')
    try {
      const reading = await fetchSensorReading('warehouse', isDev ? (warehouseForce || undefined) : scenario.force.warehouse)
      setWarehouseResult(reading)
      warehouseTiming.markSubmitted()
      const nonce = await getFreshNonce(address as `0x${string}` | undefined)
      const hash = await recordWarehouse.mutateAsync({
        address: supplyChain,
        args: [batchId, BigInt(reading.temperatureCelsius), BigInt(reading.durationMinutes)],
        nonce,
      })
      const receipt = publicClient ? await publicClient.waitForTransactionReceipt({ hash }) : undefined
      onReported()
      if (receipt?.status === 'reverted') {
        recordError({
          chainId, batchId, step: 'recordWarehouseData(lager)', actor: roleLabel(roles), address,
          message: 'Transaktion wurde on-chain zurückgewiesen (reverted).',
        })
        setWarehouseStatus('error')
        return
      }
      const { walletConfirmMs, miningMs, totalMs } = warehouseTiming.split()
      void recordStep({
        chainId, batchId, step: 'recordWarehouseData(lager)', actor: roleLabel(roles), address,
        txHash: hash, gasUsed: receipt?.gasUsed ?? 0n,
        gasPriceWei: receipt?.effectiveGasPrice,
        durationMs: totalMs, walletTiming: { walletConfirmMs, miningMs },
      })
      setWarehouseStatus('idle')
    } catch (err) {
      setWarehouseStatus('error')
      recordError({
        chainId, batchId, step: 'recordWarehouseData(lager)', actor: roleLabel(roles), address,
        message: errorMessage(err),
      })
    }
  }

  async function handleDefrost() {
    if (batchId === undefined || !supplyChain) return
    setDefrostStatus('loading')
    try {
      const reading = await fetchSensorReading('defrost', isDev ? (defrostForce || undefined) : scenario.force.defrost)
      setDefrostResult(reading)
      defrostTiming.markSubmitted()
      const nonce = await getFreshNonce(address as `0x${string}` | undefined)
      const hash = await recordDefrost.mutateAsync({
        address: supplyChain,
        args: [batchId, BigInt(reading.temperatureCelsius), BigInt(reading.durationMinutes)],
        nonce,
      })
      const receipt = publicClient ? await publicClient.waitForTransactionReceipt({ hash }) : undefined
      onReported()
      if (receipt?.status === 'reverted') {
        recordError({
          chainId, batchId, step: 'recordWarehouseData(defrost)', actor: roleLabel(roles), address,
          message: 'Transaktion wurde on-chain zurückgewiesen (reverted).',
        })
        setDefrostStatus('error')
        return
      }
      const { walletConfirmMs, miningMs, totalMs } = defrostTiming.split()
      void recordStep({
        chainId, batchId, step: 'recordWarehouseData(defrost)', actor: roleLabel(roles), address,
        txHash: hash, gasUsed: receipt?.gasUsed ?? 0n,
        gasPriceWei: receipt?.effectiveGasPrice,
        durationMs: totalMs, walletTiming: { walletConfirmMs, miningMs },
      })
      setDefrostStatus('idle')
    } catch (err) {
      setDefrostStatus('error')
      recordError({
        chainId, batchId, step: 'recordWarehouseData(defrost)', actor: roleLabel(roles), address,
        message: errorMessage(err),
      })
    }
  }

  return (
    <div>
      <PendingTxOverlay active={transportStatus === 'loading'} hash={recordTransport.data} />
      <PendingTxOverlay active={warehouseStatus === 'loading'} hash={recordWarehouse.data} />
      <PendingTxOverlay active={defrostStatus === 'loading'} hash={recordDefrost.data} />
      <p>
        {isDev && (
          <select value={transportForce} onChange={(e) => setTransportForce(e.target.value as SensorForce | '')}>
            <option value="">Zufällig</option>
            <option value="NORMAL">Normal erzwingen</option>
            <option value="VIOLATION">Verletzung erzwingen</option>
          </select>
        )}
        <button type="button" onClick={handleTransport} disabled={transportStatus === 'loading'}>
          {transportStatus === 'loading' ? 'wird gemeldet...' : 'Transportbedingungen melden'}
        </button>
        {transportResult && <span className="reading-result"> — {describeReading(transportResult)}</span>}
      </p>
      {transportStatus === 'error' && <p>Transportbedingungen melden fehlgeschlagen.</p>}
      <p>
        {isDev && (
          <select value={warehouseForce} onChange={(e) => setWarehouseForce(e.target.value as SensorForce | '')}>
            <option value="">Zufällig</option>
            <option value="NORMAL">Normal erzwingen</option>
            <option value="VIOLATION">Verletzung erzwingen</option>
          </select>
        )}
        <button type="button" onClick={handleWarehouse} disabled={warehouseStatus === 'loading'}>
          {warehouseStatus === 'loading' ? 'wird gemeldet...' : 'Lagerbedingungen melden'}
        </button>
        {warehouseResult && <span className="reading-result"> — {describeReading(warehouseResult)}</span>}
      </p>
      {warehouseStatus === 'error' && <p>Lagerbedingungen melden fehlgeschlagen.</p>}
      <p>
        {isDev && (
          <select value={defrostForce} onChange={(e) => setDefrostForce(e.target.value as SensorForce | '')}>
            <option value="">Zufällig</option>
            <option value="NORMAL">Normal erzwingen</option>
            <option value="VIOLATION">Verletzung erzwingen</option>
          </select>
        )}
        <button type="button" onClick={handleDefrost} disabled={defrostStatus === 'loading'}>
          {defrostStatus === 'loading' ? 'wird gemeldet...' : 'Auftauen melden'}
        </button>
        {defrostResult && <span className="reading-result"> — {describeReading(defrostResult)}</span>}
      </p>
      {defrostStatus === 'error' && <p>Auftauen melden fehlgeschlagen.</p>}
    </div>
  )
}

function describeReading(reading: SensorReading): string {
  return reading.violation
    ? `Temperaturverletzung! ${reading.temperatureCelsius} °C, ${reading.durationMinutes} min`
    : 'keine Temperaturverletzung'
}

export function LabDocuments({
  batchId,
  qualityIndex,
  canRequestLab,
  onQualityChanged,
  state,
}: {
  batchId: bigint | undefined
  qualityIndex: `0x${string}` | undefined
  canRequestLab: boolean
  onQualityChanged: () => void
  state: number
}) {
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { isDev, scenario } = useActiveScenario()
  const [labStatus, setLabStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [labErrorMessage, setLabErrorMessage] = useState('')
  const [labForce, setLabForce] = useState<LabForce | ''>('')

  const [lastReportData, setLastReportData] = useState<LabReportData>()
  const [labReportHistory, setLabReportHistory] = useState<string[]>([])
  const [labHistoryStatus, setLabHistoryStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const isFetchingHistoryRef = useRef(false)

  useEffect(() => {
    if (batchId === undefined) return
    setLastReportData(loadLastReportData(batchId))
  }, [batchId])

  const { data: labReportCid, refetch: refetchLabReportCid } = useReadQualityIndexPhqiReportCid({
    address: qualityIndex,
    args: batchId !== undefined ? [batchId] : undefined,
    query: { enabled: Boolean(qualityIndex && batchId !== undefined) },
  })

  async function refetchLabReportHistory() {
    if (!publicClient || !qualityIndex || batchId === undefined) return
    if (isFetchingHistoryRef.current) return
    isFetchingHistoryRef.current = true
    setLabHistoryStatus('loading')
    try {
      const fromBlock = addresses[chainId as keyof typeof addresses]?.deployedAtBlock ?? 0n
      const latest = await publicClient.getBlockNumber()
      const logs: { args: { ipfsCid?: string } }[] = []
      const CHUNK_SIZE = 10n;
      let from = fromBlock
      while (from <= latest) {
        const to = from + CHUNK_SIZE - 1n > latest ? latest : from + CHUNK_SIZE - 1n
        let attempt = 0
        for (;;) {
          try {
            const chunk = await publicClient.getContractEvents({
              address: qualityIndex,
              abi: qualityIndexAbi,
              eventName: 'PHQIDataSubmitted',
              args: { batchId },
              fromBlock: from,
              toBlock: to,
            })
            logs.push(...chunk)
            break
          } catch {
            attempt += 1
            if (attempt > 5) throw new Error('Laborbericht-Historie konnte nicht geladen werden (RPC-Anbieter dauerhaft nicht erreichbar).')
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
          }
        }
        from = to + 1n
        if (from <= latest) await new Promise((resolve) => setTimeout(resolve, 250))
      }
      setLabReportHistory(logs.map((log) => log.args.ipfsCid).filter((cid): cid is string => Boolean(cid)))
      setLabHistoryStatus('idle')
    } catch (err) {
      setLabHistoryStatus('error')
      recordError({
        chainId, batchId, step: 'labAnalysis', actor: 'lab',
        message: err instanceof Error ? err.message : 'Laborbericht-Historie konnte nicht geladen werden.',
      })
    } finally {
      isFetchingHistoryRef.current = false
    }
  }

  async function handleRequestLab() {
    if (batchId === undefined) return
    const isRetest = state === 1
    if (isRetest && !lastReportData) {
      const message = 'Nachtest nicht möglich: Der vorherige Laborbefund wurde in dieser Sitzung nicht gefunden (z. B. anderes Gerät/Browser oder Sitzungsdaten gelöscht).'
      setLabStatus('error')
      setLabErrorMessage(message)
      recordError({ chainId, batchId, step: 'labAnalysis', actor: 'lab', message })
      return
    }
    setLabStatus('loading')
    setLabErrorMessage('')
    try {
      const result = await requestLabAnalysis(
        Number(batchId),
        isRetest ? undefined : isDev ? (labForce || undefined) : scenario.force.lab,
        isRetest ? lastReportData : undefined,
      )
      setLastReportData(result.reportData)
      saveLastReportData(batchId, result.reportData)
      await refetchLabReportCid()
      if (result.ipfsCid) setLabReportHistory((prev) => [...prev, result.ipfsCid])
      onQualityChanged()
      const receipt = publicClient
        ? await publicClient.getTransactionReceipt({ hash: result.transactionHash as `0x${string}` })
        : undefined
      void recordStep({
        chainId, batchId, step: 'labAnalysis', actor: 'lab',
        txHash: result.transactionHash, gasUsed: receipt?.gasUsed ?? BigInt(result.gasUsed),
        gasPriceWei: receipt?.effectiveGasPrice,
        durationMs: result.timings.renderMs + result.timings.uploadMs + result.timings.chainMs,
        timings: result.timings, note: result.ipfsCid ? `cid=${result.ipfsCid}` : '',
      })
      setLabStatus('idle')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Laboranalyse-Anfrage fehlgeschlagen.'
      setLabStatus('error')
      setLabErrorMessage(message)
      recordError({ chainId, batchId, step: 'labAnalysis', actor: 'lab', message })
    }
  }

  return (
    <>
      <p>
        Laboranalyse:{' '}
        {labReportHistory.length > 0 ? (
          labReportHistory.map((cid, index) => (
            <span key={cid}>
              {index > 0 && ' · '}
              <a href={IPFS_GATEWAY + cid} target="_blank" rel="noreferrer">
                {labReportHistory.length === 1 ? 'ansehen' : index === 0 ? 'Befund 1' : `Befund ${index + 1} (Nachtest)`}
              </a>
            </span>
          ))
        ) : labReportCid ? (
          <a href={IPFS_GATEWAY + labReportCid} target="_blank" rel="noreferrer">ansehen</a>
        ) : (
          'noch nicht vorhanden'
        )}
        {labReportCid && (
          <>
            {' '}
            <button type="button" onClick={() => void refetchLabReportHistory()} disabled={labHistoryStatus === 'loading'}>
              {labHistoryStatus === 'loading' ? 'Verlauf wird geladen...' : 'vollständigen Verlauf laden'}
            </button>
          </>
        )}
        {labHistoryStatus === 'error' && ' (Verlauf konnte nicht geladen werden)'}
        {canRequestLab && (!labReportCid || state === 1) && (
          <>
            {' '}
            {isDev && (
              <select value={labForce} onChange={(e) => setLabForce(e.target.value as LabForce | '')}>
                <option value="">Zufällig</option>
                <option value="PREMIUM">Premium erzwingen</option>
                <option value="STANDARD">Standard erzwingen</option>
                <option value="GATEKEEPER">Gatekeeper erzwingen (nicht verkäuflich)</option>
                <option value="PHQI_EXCLUDED">PHQI ausgeschlossen erzwingen</option>
              </select>
            )}
            <button type="button" onClick={handleRequestLab} disabled={labStatus === 'loading'}>
              {labStatus === 'loading' ? 'wird angefordert...' : 'anfordern'}
            </button>
          </>
        )}
      </p>
      {labStatus === 'error' && <p>{labErrorMessage || 'Laboranalyse anfordern fehlgeschlagen.'}</p>}
    </>
  )
}

export function AwardDocuments({
  batchId,
  qualityIndex,
  isBeekeeperOfThisBatch,
  onQualityChanged,
}: {
  batchId: bigint | undefined
  qualityIndex: `0x${string}` | undefined
  isBeekeeperOfThisBatch: boolean
  onQualityChanged: () => void
}) {
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { isDev, scenario } = useActiveScenario()
  const [awardStatus, setAwardStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [awardForce, setAwardForce] = useState<AwardForce | ''>('')
  const { isRequested, markRequested } = useRequestedAwards()

  const { data: awardCertificateCid, refetch: refetchAwardCertificateCid } = useReadQualityIndexAwardCertificateCid({
    address: qualityIndex,
    args: batchId !== undefined ? [batchId] : undefined,
    query: { enabled: Boolean(qualityIndex && batchId !== undefined) },
  })

  async function handleRequestAward() {
    if (batchId === undefined) return
    setAwardStatus('loading')
    try {
      const result = await requestAward(Number(batchId), isDev ? (awardForce || undefined) : scenario.force.award)
      await refetchAwardCertificateCid()
      markRequested(Number(batchId))
      onQualityChanged()
      const receipt = publicClient
        ? await publicClient.getTransactionReceipt({ hash: result.transactionHash as `0x${string}` })
        : undefined
      void recordStep({
        chainId, batchId, step: 'award', actor: 'awardBody',
        txHash: result.transactionHash, gasUsed: receipt?.gasUsed ?? BigInt(result.gasUsed),
        gasPriceWei: receipt?.effectiveGasPrice,
        durationMs: result.timings.renderMs + result.timings.uploadMs + result.timings.chainMs,
        timings: result.timings, note: result.ipfsCid ? `cid=${result.ipfsCid}` : '',
      })
      setAwardStatus('idle')
    } catch (err) {
      setAwardStatus('error')
      recordError({
        chainId, batchId, step: 'award', actor: 'awardBody',
        message: err instanceof Error ? err.message : 'Prämierungs-Anfrage fehlgeschlagen.',
      })
    }
  }

  return (
    <>
      <p>
        Prämierungsurkunde:{' '}
        {awardCertificateCid ? (
          <a href={IPFS_GATEWAY + awardCertificateCid} target="_blank" rel="noreferrer">
            ansehen
          </a>
        ) : batchId !== undefined && isRequested(Number(batchId)) ? (
          'keine Prämierung erhalten'
        ) : (
          'noch nicht angefordert'
        )}
        {isBeekeeperOfThisBatch && !awardCertificateCid && !(batchId !== undefined && isRequested(Number(batchId))) && (
          <>
            {' '}
            {isDev && (
              <select value={awardForce} onChange={(e) => setAwardForce(e.target.value as AwardForce | '')}>
                <option value="">Zufällig</option>
                <option value="NONE">Keine erzwingen</option>
                <option value="BRONZE">Bronze erzwingen</option>
                <option value="SILVER">Silber erzwingen</option>
                <option value="GOLD">Gold erzwingen</option>
              </select>
            )}
            <button type="button" onClick={handleRequestAward} disabled={awardStatus === 'loading'}>
              {awardStatus === 'loading' ? 'wird angefordert...' : 'anfordern'}
            </button>
          </>
        )}
      </p>
      {awardStatus === 'error' && <p>Prämierung anfordern fehlgeschlagen.</p>}
    </>
  )
}

export function CertificateDocument({
  beekeeper,
  actorRegistry,
  organicScore,
}: {
  beekeeper: `0x${string}`
  actorRegistry: `0x${string}` | undefined
  organicScore: number | undefined
}) {
  const { data: certificationData } = useReadActorRegistryCertifications({
    address: actorRegistry,
    args: [beekeeper],
    query: { enabled: Boolean(actorRegistry && organicScore) },
  })
  const [beekeeperCertCid] = certificationData ?? ['']

  if (!organicScore) return null

  return (
    <p>
      Zertifikat des Imkers:{' '}
      {beekeeperCertCid ? (
        <a href={IPFS_GATEWAY + beekeeperCertCid} target="_blank" rel="noreferrer">
          ansehen
        </a>
      ) : (
        '...'
      )}
    </p>
  )
}

export default BatchDetail
