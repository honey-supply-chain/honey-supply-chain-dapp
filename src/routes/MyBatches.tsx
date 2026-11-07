import { Link } from 'react-router-dom'
import { useChainId } from 'wagmi'
import { useMyBatches } from '../hooks/useMyBatches'
import { useMyRoles } from '../hooks/useMyRoles'
import { useOriginPlaces } from '../hooks/useOriginPlaces'
import {
  useReadProductGatewayGetBatchData,
  useReadProductGatewayGetQualityData,
  useReadProductGatewayGetPrice,
} from '../generated'
import { addresses } from '../addresses'

function MyBatchRow({ id }: { id: number }) {
  const chainId = useChainId()
  const productGateway = addresses[chainId as keyof typeof addresses]?.ProductGateway
  const batchId = BigInt(id)

  const { data: batchData } = useReadProductGatewayGetBatchData({
    address: productGateway,
    args: [batchId],
    query: { enabled: Boolean(productGateway) },
  })
  const { data: qualityData } = useReadProductGatewayGetQualityData({
    address: productGateway,
    args: [batchId],
    query: { enabled: Boolean(productGateway) },
  })
  const priceQuery = useReadProductGatewayGetPrice({
    address: productGateway,
    args: [batchId, 500],
    query: { enabled: Boolean(productGateway) },
  })
  const originPlaces = useOriginPlaces(batchId)

  const quantityKg = batchData ? (Number(batchData[0].quantity) / 1000).toFixed(1) : '...'
  const qiFraction = qualityData ? (Number(qualityData[3]) / 10000).toFixed(4) : '...'
  const price = priceQuery.isError
    ? 'nicht verkäuflich'
    : priceQuery.data !== undefined
      ? `${(Number(priceQuery.data) / 100).toFixed(2)} €`
      : '...'
  const herkunft = originPlaces ? (originPlaces.length > 0 ? originPlaces.join(', ') : 'noch nicht eingetragen') : '...'

  return (
    <tr>
      <td><Link to={`/batches/${id}`}>Charge #{id}</Link></td>
      <td>{quantityKg} kg</td>
      <td>{qiFraction}</td>
      <td>{price}</td>
      <td>{herkunft}</td>
      <td><Link to={`/product/${id}`} state={{ fromApp: true }}>Produktansicht</Link></td>
    </tr>
  )
}

function MyBatchesTable({ ids }: { ids: number[] }) {
  if (ids.length === 0) return <p>keine</p>

  return (
    <table>
      <thead>
        <tr>
          <th>Charge</th>
          <th>Menge</th>
          <th>QI</th>
          <th>Preis (500 g)</th>
          <th>Herkunft</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {ids.map((id) => <MyBatchRow key={id} id={id} />)}
      </tbody>
    </table>
  )
}

function MyBatches() {
  const { asHolder, asBeekeeper, isLoading } = useMyBatches()
  const roles = useMyRoles()

  if (isLoading) {
    return <p>Lädt...</p>
  }

  return (
    <div>
      <h1>Meine Chargen</h1>

      <h2>Aktuell bei mir</h2>
      <MyBatchesTable ids={asHolder} />

      {roles.beekeeper && (
        <>
          <h2>Meine Ernte (als Imker)</h2>
          <MyBatchesTable ids={asBeekeeper} />
        </>
      )}
    </div>
  )
}

export default MyBatches
