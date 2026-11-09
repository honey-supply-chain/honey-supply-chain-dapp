import { Navigate } from 'react-router-dom'
import { useChainId, useConnection } from 'wagmi'
import { useMyRoles } from '../hooks/useMyRoles'
import { useActorName } from '../hooks/useActorName'
import { useReadActorRegistryCertifications } from '../generated'
import { addresses } from '../addresses'
import { CERTIFICATION_LABELS } from './BatchDetail'
import Tile from '../components/Tile'
import { bytes32ToCid } from '../lib/cid'

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/'

function Dashboard() {
  const chainId = useChainId()
  const { address, isConnected } = useConnection()
  const roles = useMyRoles()
  const name = useActorName(address)
  const actorRegistry = addresses[chainId as keyof typeof addresses]?.ActorRegistry
  const { data: certificationData } = useReadActorRegistryCertifications({
    address: actorRegistry,
    args: address ? [address] : undefined,
    query: { enabled: Boolean(actorRegistry && address && roles.beekeeper) },
  })
  const [certCidHash, organicScore] = certificationData ?? [undefined, 0]
  const certCid = bytes32ToCid(certCidHash)

  if (!isConnected) {
    return <Navigate to="/" replace />
  }

  return (
    <div>
      <h2>Halter-Daten</h2>
      <p>Name: {name}</p>
      {roles.beekeeper && (
        <p>
          Zertifikat: {CERTIFICATION_LABELS[organicScore] ?? 'unbekannt'}
          {certCid && (
            <>
              {' '}— <a href={IPFS_GATEWAY + certCid} target="_blank" rel="noreferrer">ansehen</a>
            </>
          )}
        </p>
      )}

      <h2>Meine Rollen</h2>
      {roles.isLoading ? (
        <p>Rollen werden geladen...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Rolle</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Imker</td>
              <td>{roles.beekeeper ? 'ja' : 'nein'}</td>
            </tr>
            <tr>
              <td>Abfüller</td>
              <td>{roles.bottler ? 'ja' : 'nein'}</td>
            </tr>
            <tr>
              <td>Einzelhändler</td>
              <td>{roles.retailer ? 'ja' : 'nein'}</td>
            </tr>
            <tr>
              <td>Logistik</td>
              <td>{roles.logistics ? 'ja' : 'nein'}</td>
            </tr>
          </tbody>
        </table>
      )}

      <Tile to="/my-batches" label="Meine Chargen" />
      <Tile to="/measurements" label="Messwerte" />
      <Tile to="/product" label="Produktansicht" state={{ fromApp: true }} />

      {roles.beekeeper && (
        <div>
          <h2>Aktionen</h2>
          <Tile to="/apiaries" label="Bienenstände" />
          <Tile to="/harvest" label="Ernte eintragen" />
          <Tile to="/batches/new" label="Charge anlegen" />
          <Tile to="/certification" label="Zertifikat beantragen" />
        </div>
      )}
    </div>
  )
}

export default Dashboard
