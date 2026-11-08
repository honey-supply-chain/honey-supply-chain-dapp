import { useState, type SubmitEvent } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useChainId } from 'wagmi'
import {
  useReadProductGatewayGetBatchData,
  useReadProductGatewayGetQualityData,
  useReadProductGatewayGetPrice,
  useReadHoneyTokenProcessedBatches,
  useReadPricingModelAlpha,
  useReadPricingModelFloorPrices,
  useReadPricingModelCalculatePriceForPhqi,
  useReadQualityIndexMciData,
} from '../generated'
import { addresses } from '../addresses'
import ActorLabel from '../components/ActorLabel'
import { LabDocuments, AwardDocuments, CertificateDocument, REASON_LABELS, CERTIFICATION_LABELS, SI_INFO, PHQI_INFO, MCI_INFO, QI_INFO } from './BatchDetail'
import { useJarCount } from '../hooks/useJarCount'
import { useOriginPlaces } from '../hooks/useOriginPlaces'
import { useCustodyHistory } from '../hooks/useCustodyHistory'
import { useBottledAt } from '../hooks/useBottledAt'
import { useMyRoles } from '../hooks/useMyRoles'
import { usePHQIRevision } from '../hooks/usePHQIRevision'
import InfoPopover from '../components/InfoPopover'

const QI_WEIGHT_PHQI = 0.539
const QI_WEIGHT_MCI = 0.2972
const QI_WEIGHT_SI = 0.1638

function ProductView() {
  const chainId = useChainId()
  const { batchId: batchIdParam } = useParams<{ batchId?: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  // Nur gesetzt, wenn ein Link aus der dApp selbst hierher verlinkt hat (state={{ fromApp: true }}) -
  // ein Kaeufer, der die URL direkt (z.B. vom Etikett) aufruft, hat keinen "Zurück"-Link, weil es für
  // ihn keine vorherige dApp-Seite gibt, zu der man zurückkehren könnte.
  const cameFromApp = Boolean((location.state as { fromApp?: boolean } | null)?.fromApp)
  const [inputId, setInputId] = useState(batchIdParam ?? '')
  // Per Link/Button mit Chargen-Nummer in der URL (z.B. von "Meine Chargen" oder der Chargenansicht)
  // direkt die passende Produktansicht oeffnen, ohne dass die Nummer erneut eingegeben werden muss.
  const [batchId, setBatchId] = useState<bigint | undefined>(batchIdParam ? BigInt(batchIdParam) : undefined)

  const productGateway = addresses[chainId as keyof typeof addresses]?.ProductGateway
  const qualityIndex = addresses[chainId as keyof typeof addresses]?.QualityIndex
  const actorRegistry = addresses[chainId as keyof typeof addresses]?.ActorRegistry
  const honeyToken = addresses[chainId as keyof typeof addresses]?.HoneyToken
  const pricingModel = addresses[chainId as keyof typeof addresses]?.PricingModel
  const enabled = Boolean(productGateway && batchId !== undefined)

  const { data: alpha } = useReadPricingModelAlpha({ address: pricingModel, query: { enabled: Boolean(pricingModel) } })
  const { data: floorPrice } = useReadPricingModelFloorPrices({
    address: pricingModel,
    args: [500],
    query: { enabled: Boolean(pricingModel) },
  })

  const { data: processed } = useReadHoneyTokenProcessedBatches({
    address: honeyToken,
    args: batchId !== undefined ? [batchId] : undefined,
    query: { enabled: Boolean(honeyToken && batchId !== undefined) },
  })
  const bottledAt = useBottledAt(batchId)

  const { data: batchData } = useReadProductGatewayGetBatchData({
    address: productGateway,
    args: batchId !== undefined ? [batchId] : undefined,
    query: { enabled },
  })
  const { data: qualityData } = useReadProductGatewayGetQualityData({
    address: productGateway,
    args: batchId !== undefined ? [batchId] : undefined,
    query: { enabled },
  })
  const priceQuery = useReadProductGatewayGetPrice({
    address: productGateway,
    args: batchId !== undefined ? [batchId, 500] : undefined,
    query: { enabled },
  })

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    if (!inputId) return
    setBatchId(BigInt(inputId))
  }

  return (
    <div>
      {cameFromApp && (
        <p><button type="button" onClick={() => navigate(-1)}>← Zurück</button></p>
      )}
      <h1>Produktansicht</h1>
      <p><em>Öffentliche Produktinformationen</em></p>
      <form onSubmit={handleSubmit}>
        <label>
          Chargen-Nummer
          <input value={inputId} onChange={(e) => setInputId(e.target.value)} required />
        </label>
        <button type="submit">Anzeigen</button>
      </form>

      {batchId !== undefined && (!batchData || !qualityData) && <p>Lädt...</p>}

      {batchId !== undefined && batchData && qualityData && (
        <ProductBatchDetails
          batchId={batchId}
          batch={batchData[0]}
          holder={batchData[1]}
          qualityData={qualityData}
          priceQuery={priceQuery}
          qualityIndex={qualityIndex}
          actorRegistry={actorRegistry}
          alpha={alpha}
          floorPrice={floorPrice}
          processed={processed}
          bottledAt={bottledAt}
          pricingModel={pricingModel}
        />
      )}
    </div>
  )
}

function ProductBatchDetails({
  batchId,
  batch,
  holder,
  qualityData,
  priceQuery,
  qualityIndex,
  actorRegistry,
  alpha,
  floorPrice,
  processed,
  bottledAt,
  pricingModel,
}: {
  batchId: bigint
  batch: { harvestYear: number; beekeeper: `0x${string}`; quantity: bigint }
  holder: `0x${string}`
  qualityData: readonly [bigint, bigint, bigint, bigint, number, number]
  priceQuery: { isError: boolean; data: bigint | undefined }
  qualityIndex: `0x${string}` | undefined
  actorRegistry: `0x${string}` | undefined
  alpha: bigint | undefined
  floorPrice: bigint | undefined
  processed: boolean | undefined
  bottledAt: bigint | undefined
  pricingModel: `0x${string}` | undefined
}) {
  const [si, phqi, mci, qi, state, reason] = qualityData
  const jarCount = useJarCount(batchId, holder)
  const originPlaces = useOriginPlaces(batchId)
  const { data: mciData } = useReadQualityIndexMciData({
    address: qualityIndex,
    args: [batchId],
    query: { enabled: Boolean(qualityIndex) },
  })
  const organicScore = mciData?.[2]
  const { records: custodyRecords } = useCustodyHistory(batchId)
  const custodyHolders = [batch.beekeeper, ...custodyRecords.map((record) => record.to)]
  const holderRoles = useMyRoles(holder)
  const isSellable = holderRoles.retailer && Boolean(processed) && state === 0
  const retailedSince = custodyRecords.length > 0 ? custodyRecords[custodyRecords.length - 1].timestamp : undefined
  const oldPhqi = usePHQIRevision(batchId)
  const { data: oldPrice } = useReadPricingModelCalculatePriceForPhqi({
    address: pricingModel,
    args: oldPhqi !== undefined ? [batchId, oldPhqi, 500] : undefined,
    query: { enabled: Boolean(pricingModel && oldPhqi !== undefined) },
  })

  const siFraction = Number(si) / 10000
  const phqiFraction = Number(phqi) / 10000
  const mciFraction = Number(mci) / 10000
  const qiFraction = Number(qi) / 10000
  const alphaFraction = alpha !== undefined ? Number(alpha) / 10000 : undefined
  const floorEuro = floorPrice !== undefined ? Number(floorPrice) / 100 : undefined

  const status =
    state === 1
      ? { kind: 'warning', text: `Charge gesperrt – Nachprüfung erforderlich (${REASON_LABELS[reason] ?? 'unbekannter Grund'})` }
      : state === 2
        ? { kind: 'warning', text: `Nicht verkaufsfähig (${REASON_LABELS[reason] ?? 'unbekannter Grund'})` }
        : isSellable
          ? {
              kind: 'success',
              text: `Verkaufsbereit – abgefüllt am ${bottledAt ? new Date(Number(bottledAt) * 1000).toLocaleString() : '...'}`
                + (retailedSince ? `, beim Händler seit ${new Date(Number(retailedSince) * 1000).toLocaleString()}` : ''),
            }
          : { kind: 'info', text: 'Charge in Bearbeitung – noch nicht verkaufsbereit' }

  return (
    <div>
      <h2>Charge #{batchId.toString()}</h2>
      <p className={`status-banner ${status.kind}`}>{status.text}</p>

      <h3>Grunddaten</h3>
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

      <h3>Lieferkette</h3>
      <table>
        <thead>
          <tr>
            <th>Halter</th>
            <th>Erhalten am</th>
            <th>Übergeben am</th>
          </tr>
        </thead>
        <tbody>
          {custodyHolders.map((holderAddress, index) => (
            <tr key={index}>
              <td><ActorLabel address={holderAddress} /></td>
              <td>{index === 0 ? '—' : new Date(Number(custodyRecords[index - 1].timestamp) * 1000).toLocaleString()}</td>
              <td>
                {index === custodyHolders.length - 1
                  ? '—'
                  : new Date(Number(custodyRecords[index].timestamp) * 1000).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Qualität</h3>
      <p>Standort-Index (SI)<InfoPopover text={SI_INFO} />: {siFraction.toFixed(4)}</p>
      <p>Physikalisch-chemischer Honigqualitätsindex (PHQI)<InfoPopover text={PHQI_INFO} />: {phqiFraction.toFixed(4)}</p>
      <p>Marktbezogener Charakterisierungsindex (MCI)<InfoPopover text={MCI_INFO} />: {mciFraction.toFixed(4)}</p>
      <p>Qualitätsindex (QI)<InfoPopover text={QI_INFO} />: {qiFraction.toFixed(4)}</p>

      <h3>Status</h3>
      <p>Abgefüllte Gläser (500 g): {jarCount !== undefined ? jarCount.toString() : '...'}</p>
      <p>
        Preis (500 g):{' '}
        {priceQuery.isError
          ? 'nicht verkäuflich'
          : priceQuery.data !== undefined
            ? `${(Number(priceQuery.data) / 100).toFixed(2)} €`
            : '...'}
      </p>
      {oldPhqi !== undefined && (
        <p>
          Preis vor der letzten Nachprüfung (500 g):{' '}
          {oldPrice !== undefined ? `${(Number(oldPrice) / 100).toFixed(2)} €` : '...'}
        </p>
      )}

      <h3>Preisbildungslogik</h3>
      <p>
        QI = PHQI × {(QI_WEIGHT_PHQI * 100).toFixed(2)} % + MCI × {(QI_WEIGHT_MCI * 100).toFixed(2)} % + SI ×{' '}
        {(QI_WEIGHT_SI * 100).toFixed(2)} %
        <br />
        = {phqiFraction.toFixed(4)} × {QI_WEIGHT_PHQI} + {mciFraction.toFixed(4)} × {QI_WEIGHT_MCI} +{' '}
        {siFraction.toFixed(4)} × {QI_WEIGHT_SI} = {qiFraction.toFixed(4)}
      </p>
      {!priceQuery.isError && alphaFraction !== undefined && floorEuro !== undefined && (
        <p>
          Preis = Grundpreis × (1 + alpha × QI)
          <br />
          = {floorEuro.toFixed(2)} € × (1 + {alphaFraction} × {qiFraction.toFixed(4)}) ={' '}
          {(floorEuro * (1 + alphaFraction * qiFraction)).toFixed(2)} €
        </p>
      )}

      <h3>Dokumente</h3>
      <LabDocuments
        batchId={batchId}
        qualityIndex={qualityIndex}
        canRequestLab={false}
        onQualityChanged={() => {}}
        state={state}
      />
      <AwardDocuments
        batchId={batchId}
        qualityIndex={qualityIndex}
        isBeekeeperOfThisBatch={false}
        onQualityChanged={() => {}}
      />
      <CertificateDocument beekeeper={batch.beekeeper} actorRegistry={actorRegistry} organicScore={organicScore} />
    </div>
  )
}

export default ProductView
