import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useChainId, useConnection, useWaitForTransactionReceipt } from 'wagmi'
import {
  useReadActorRegistryGetAllActors,
  useReadProductGatewayGetBatchData,
  useReadHoneyTokenIsApprovedForAll,
  useWriteHoneyTokenSetApprovalForAll,
  useWriteSupplyChainTransferCustody,
} from '../generated'
import { addresses } from '../addresses'
import { useMyRoles } from '../hooks/useMyRoles'
import { recordStep, recordError, roleLabel, errorMessage } from '../measurements'
import { useTxTiming } from '../hooks/useTxTiming'
import { getFreshNonce } from '../nonce'
import PendingTxOverlay from '../components/PendingTxOverlay'

function TransferCustody() {
  const { batchId } = useParams()
  const chainId = useChainId()
  const { address } = useConnection()
  const productGateway = addresses[chainId as keyof typeof addresses]?.ProductGateway
  const actorRegistry = addresses[chainId as keyof typeof addresses]?.ActorRegistry
  const honeyToken = addresses[chainId as keyof typeof addresses]?.HoneyToken
  const supplyChain = addresses[chainId as keyof typeof addresses]?.SupplyChain
  const id = batchId ? BigInt(batchId) : undefined

  const { data: batchData } = useReadProductGatewayGetBatchData({
    address: productGateway,
    args: id !== undefined ? [id] : undefined,
    query: { enabled: Boolean(productGateway && id !== undefined) },
  })
  const { data: actorsData } = useReadActorRegistryGetAllActors({ address: actorRegistry })
  const { data: isApproved, refetch: refetchApproval } = useReadHoneyTokenIsApprovedForAll({
    address: honeyToken,
    args: address && supplyChain ? [address, supplyChain] : undefined,
    query: { enabled: Boolean(honeyToken && address && supplyChain) },
  })

  const [selected, setSelected] = useState('')
  const roles = useMyRoles()
  const approveErrorRecorded = useRef(false)
  const transferErrorRecorded = useRef(false)

  const approve = useWriteHoneyTokenSetApprovalForAll()
  const approveReceipt = useWaitForTransactionReceipt({ hash: approve.data })
  const approveTiming = useTxTiming(approve.data)
  const transfer = useWriteSupplyChainTransferCustody()
  const transferReceipt = useWaitForTransactionReceipt({ hash: transfer.data })
  const transferTiming = useTxTiming(transfer.data)

  useEffect(() => {
    if (approve.isError && !approveErrorRecorded.current) {
      approveErrorRecorded.current = true
      recordError({
        chainId, batchId: id, step: 'setApprovalForAll', actor: roleLabel(roles), address,
        message: errorMessage(approve.error),
      })
    }
  }, [approve.isError])

  useEffect(() => {
    if (transfer.isError && !transferErrorRecorded.current) {
      transferErrorRecorded.current = true
      recordError({
        chainId, batchId: id, step: 'transferCustody', actor: roleLabel(roles), address,
        message: errorMessage(transfer.error),
      })
    }
  }, [transfer.isError])

  useEffect(() => {
    if (!approveReceipt.isSuccess || !approveReceipt.data) return
    refetchApproval()
    if (approveReceipt.data.status === 'reverted') {
      recordError({
        chainId, batchId: id, step: 'setApprovalForAll', actor: roleLabel(roles), address,
        message: 'Transaktion wurde on-chain zurückgewiesen (reverted).',
      })
      return
    }
    const { walletConfirmMs, miningMs, totalMs } = approveTiming.split()
    void recordStep({
      chainId, batchId: id, step: 'setApprovalForAll', actor: roleLabel(roles), address,
      txHash: approveReceipt.data.transactionHash, gasUsed: approveReceipt.data.gasUsed,
      gasPriceWei: approveReceipt.data.effectiveGasPrice,
      durationMs: totalMs, walletTiming: { walletConfirmMs, miningMs },
    })
  }, [approveReceipt.isSuccess])

  useEffect(() => {
    if (!transferReceipt.isSuccess || !transferReceipt.data) return
    if (transferReceipt.data.status === 'reverted') {
      recordError({
        chainId, batchId: id, step: 'transferCustody', actor: roleLabel(roles), address,
        message: 'Transaktion wurde on-chain zurückgewiesen (reverted).',
      })
      return
    }
    const { walletConfirmMs, miningMs, totalMs } = transferTiming.split()
    void recordStep({
      chainId, batchId: id, step: 'transferCustody', actor: roleLabel(roles), address,
      txHash: transferReceipt.data.transactionHash, gasUsed: transferReceipt.data.gasUsed,
      gasPriceWei: transferReceipt.data.effectiveGasPrice,
      durationMs: totalMs, walletTiming: { walletConfirmMs, miningMs },
    })
  }, [transferReceipt.isSuccess])

  if (!batchData || !actorsData) {
    return <p>Lädt...</p>
  }

  const [, holder] = batchData
  const [actorAddresses, actorList] = actorsData
  const options = actorAddresses
    .map((addr, i) => ({ address: addr, name: actorList[i].name }))
    .filter((actor) => actor.address.toLowerCase() !== holder.toLowerCase())

  async function handleApprove() {
    if (!supplyChain) return
    approveErrorRecorded.current = false
    approveTiming.markSubmitted()
    const nonce = await getFreshNonce(address as `0x${string}` | undefined)
    approve.mutate({ address: honeyToken, args: [supplyChain, true], nonce })
  }

  async function handleTransfer(event: SubmitEvent) {
    event.preventDefault()
    if (!id || !supplyChain || !selected) return
    transferErrorRecorded.current = false
    transferTiming.markSubmitted()
    const nonce = await getFreshNonce(address as `0x${string}` | undefined)
    transfer.mutate({ address: supplyChain, args: [id, selected as `0x${string}`], nonce })
  }

  if (transferReceipt.isSuccess) {
    return (
      <div>
        <p>Charge übergeben.</p>
        <Link to={`/batches/${batchId}`} className="tile">Zur Charge</Link>
      </div>
    )
  }

  return (
    <div>
      <PendingTxOverlay active={approve.isPending || approveReceipt.isLoading} hash={approve.data} />
      <PendingTxOverlay active={transfer.isPending || transferReceipt.isLoading} hash={transfer.data} />
      <h1>Charge übergeben — #{batchId}</h1>

      {!isApproved ? (
        <div>
          <p>Bevor du Chargen übergeben kannst, muss SupplyChain einmalig für dein Konto freigegeben werden.</p>
          <button type="button" onClick={handleApprove} disabled={approve.isPending || approveReceipt.isLoading}>
            {approve.isPending || approveReceipt.isLoading ? 'wird freigegeben...' : 'Freigabe erteilen'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleTransfer}>
          <label>
            Empfänger
            <select value={selected} onChange={(e) => setSelected(e.target.value)} required>
              <option value="" disabled>bitte wählen</option>
              {options.map((actor) => (
                <option key={actor.address} value={actor.address}>
                  {actor.name} ({actor.address.slice(0, 6)}…{actor.address.slice(-4)})
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={transfer.isPending || transferReceipt.isLoading}>
            {transfer.isPending || transferReceipt.isLoading ? 'wird übergeben...' : 'Übergeben'}
          </button>
        </form>
      )}
    </div>
  )
}

export default TransferCustody
