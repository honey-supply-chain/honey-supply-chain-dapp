import { useState, type SubmitEvent } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useChainId } from 'wagmi'
import {
  useReadProductGatewayGetBatchData,
  useReadProductGatewayGetQualityData,
  useReadProductGatewayGetPrice,
  useReadSupplyChainRetailReceiptTimestamp,
  useReadPricingModelAlpha,
  useReadPricingModelFloorPrices,
} from '../generated'
import { addresses } from '../addresses'
import ActorLabel from '../components/ActorLabel'
import { BatchDocuments, REASON_LABELS } from './BatchDetail'
import { useJarCount } from '../hooks/useJarCount'
import { useOriginPlaces } from '../hooks/useOriginPlaces'

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
  const supplyChain = addresses[chainId as keyof typeof addresses]?.SupplyChain
  const pricingModel = addresses[chainId as keyof typeof addresses]?.PricingModel
  const enabled = Boolean(productGateway && batchId !== undefined)

  const { data: alpha } = useReadPricingModelAlpha({ address: pricingModel, query: { enabled: Boolean(pricingModel) } })
  const { data: floorPrice } = useReadPricingModelFloorPrices({
    address: pricingModel,
    args: [500],
    query: { enabled: Boolean(pricingModel) },
  })

  // Nicht mehr an den Wareneingang gekoppelt: die Produktansicht zeigt eine Charge unabhängig vom
  // Fortschritt in der Lieferkette, der Wareneingang fließt nur noch in den Statushinweis oben ein.
  const retailReceiptQuery = useReadSupplyChainRetailReceiptTimestamp({
    address: supplyChain,
    args: batchId !== undefined ? [batchId] : undefined,
    query: { enabled: Boolean(supplyChain && batchId !== undefined) },
  })

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
          retailReceiptTimestamp={retailReceiptQuery.data}
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
  retailReceiptTimestamp,
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
  retailReceiptTimestamp: bigint | undefined
}) {
  const [si, phqi, mci, qi, state, reason] = qualityData
  const jarCount = useJarCount(batchId, holder)
  const originPlaces = useOriginPlaces(batchId)

  const siFraction = Number(si) / 10000
  const phqiFraction = Number(phqi) / 10000
  const mciFraction = Number(mci) / 10000
  const qiFraction = Number(qi) / 10000
  const alphaFraction = alpha !== undefined ? Number(alpha) / 10000 : undefined
  const floorEuro = floorPrice !== undefined ? Number(floorPrice) / 100 : undefined

  // Statushinweis zuerst nach dem Qualitätszustand (Sperre/Nicht-verkaufsfähig geht immer vor), erst
  // danach nach dem Lieferkettenfortschritt (Wareneingang) - eine gesperrte Charge bleibt gesperrt,
  // auch wenn sie zufällig schon im Handel wäre.
  const status =
    state === 1
      ? { kind: 'warning', text: `Charge gesperrt – Nachprüfung erforderlich (${REASON_LABELS[reason] ?? 'unbekannter Grund'})` }
      : state === 2
        ? { kind: 'warning', text: `Nicht verkaufsfähig (${REASON_LABELS[reason] ?? 'unbekannter Grund'})` }
        : retailReceiptTimestamp
          ? { kind: 'success', text: `Im Handel seit ${new Date(Number(retailReceiptTimestamp) * 1000).toLocaleString()}` }
          : { kind: 'info', text: 'Charge in Bearbeitung – noch nicht im Handel' }

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

      <h3>Qualität</h3>
      <p>SI: {siFraction.toFixed(4)}</p>
      <p>PHQI: {phqiFraction.toFixed(4)}</p>
      <p>MCI: {mciFraction.toFixed(4)}</p>
      <p>QI: {qiFraction.toFixed(4)}</p>

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
      <BatchDocuments
        batchId={batchId}
        beekeeper={batch.beekeeper}
        qualityIndex={qualityIndex}
        actorRegistry={actorRegistry}
        isBeekeeperOfThisBatch={false}
        canRequestLab={false}
        onQualityChanged={() => {}}
        state={state}
      />
    </div>
  )
}

export default ProductView
