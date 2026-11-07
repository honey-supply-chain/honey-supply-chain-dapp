import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import { useChainId, useConnection, useWaitForTransactionReceipt } from 'wagmi'
import { useReadSupplyChainNextBatchId, useWriteSupplyChainRegisterHarvestBatch } from '../generated'
import { addresses } from '../addresses'
import { useApiaries } from '../hooks/useApiaries'
import { useHarvest } from '../hooks/useHarvest'
import { useBatchComposition } from '../hooks/useBatchComposition'
import { recordStep, recordError, errorMessage } from '../measurements'
import { useTxTiming } from '../hooks/useTxTiming'
import { getFreshNonce } from '../nonce'
import { Link } from 'react-router-dom'
import PendingTxOverlay from '../components/PendingTxOverlay'

type Row = { apiaryId: number; kg: string }

// BigInt() throws on a non-integer, and kg * 1000 can land just off an integer due to
// floating-point rounding (e.g. 0.1 * 1000 === 100.00000000000001), so round explicitly.
function toGrams(kg: string): number {
  return Math.round(Number(kg) * 1000)
}

function NewBatch() {
  const chainId = useChainId()
  const { address } = useConnection()
  const supplyChain = addresses[chainId as keyof typeof addresses]?.SupplyChain
  const { apiaries } = useApiaries()
  const { remaining, consumeFromPool } = useHarvest()
  const { saveComposition } = useBatchComposition()

  const [year, setYear] = useState(new Date().getFullYear())
  const [rows, setRows] = useState<Row[]>([{ apiaryId: apiaries[0]?.id ?? 0, kg: '' }])
  const [consumed, setConsumed] = useState(false)
  const errorRecorded = useRef(false)

  const { data: nextBatchId } = useReadSupplyChainNextBatchId({ address: supplyChain })
  const registerBatch = useWriteSupplyChainRegisterHarvestBatch()
  const receipt = useWaitForTransactionReceipt({ hash: registerBatch.data })
  const timing = useTxTiming(registerBatch.data)

  useEffect(() => {
    if (registerBatch.isError && !errorRecorded.current) {
      errorRecorded.current = true
      recordError({
        chainId, batchId: nextBatchId, step: 'registerHarvestBatch', actor: 'beekeeper', address,
        message: errorMessage(registerBatch.error),
      })
    }
  }, [registerBatch.isError])

  useEffect(() => {
    if (!receipt.isSuccess || !receipt.data || consumed) return
    if (receipt.data.status === 'reverted') {
      recordError({
        chainId, batchId: nextBatchId, step: 'registerHarvestBatch', actor: 'beekeeper', address,
        message: 'Transaktion wurde on-chain zurückgewiesen (reverted).',
      })
      return
    }
    if (nextBatchId === undefined) return
    consumeFromPool(rows.map((row) => ({ apiaryId: row.apiaryId, year, grams: toGrams(row.kg) })))
    saveComposition(Number(nextBatchId), rows.map((row) => ({ apiaryId: row.apiaryId, grams: toGrams(row.kg) })))
    setConsumed(true)
    const { walletConfirmMs, miningMs, totalMs } = timing.split()
    void recordStep({
      chainId, batchId: nextBatchId, step: 'registerHarvestBatch', actor: 'beekeeper', address,
      txHash: receipt.data.transactionHash, gasUsed: receipt.data.gasUsed, gasPriceWei: receipt.data.effectiveGasPrice,
      durationMs: totalMs, walletTiming: { walletConfirmMs, miningMs },
    })
  }, [receipt.isSuccess])

  function apiaryName(id: number) {
    return apiaries.find((a) => a.id === id)?.name ?? `#${id}`
  }

  function updateRow(index: number, changes: Partial<Row>) {
    setRows(rows.map((row, i) => (i === index ? { ...row, ...changes } : row)))
  }

  function addRow() {
    setRows([...rows, { apiaryId: apiaries[0]?.id ?? 0, kg: '' }])
  }

  function removeRow(index: number) {
    setRows(rows.filter((_, i) => i !== index))
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    if (!supplyChain) return
    for (const row of rows) {
      if (toGrams(row.kg) > remaining(row.apiaryId, year)) {
        alert(`Nicht genug Ernte von ${apiaryName(row.apiaryId)} für ${year} übrig.`)
        return
      }
    }
    const standIds = rows.map((row) => BigInt(row.apiaryId))
    const quantities = rows.map((row) => BigInt(toGrams(row.kg)))
    errorRecorded.current = false
    timing.markSubmitted()
    const nonce = await getFreshNonce(address as `0x${string}` | undefined)
    registerBatch.mutate({ address: supplyChain, args: [year, standIds, quantities], nonce })
  }

  if (apiaries.length === 0) {
    return <p>Zuerst einen Bienenstand anlegen und Ernte eintragen.</p>
  }

  if (receipt.isSuccess) {
    return (
      <div>
        <p>Charge #{nextBatchId?.toString()} wurde angelegt.</p>
        <Link to={`/batches/${nextBatchId}`} className="tile">Ansehen</Link>
      </div>
    )
  }

  return (
    <div>
      <PendingTxOverlay active={registerBatch.isPending || receipt.isLoading} hash={registerBatch.data} />
      <h1>Charge anlegen</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Erntejahr
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} required />
        </label>

        {rows.map((row, index) => (
          <div key={index}>
            <select value={row.apiaryId} onChange={(e) => updateRow(index, { apiaryId: Number(e.target.value) })}>
              {apiaries.map((apiary) => (
                <option key={apiary.id} value={apiary.id}>
                  {apiary.name} (verfügbar: {(remaining(apiary.id, year) / 1000).toFixed(1)} kg)
                </option>
              ))}
            </select>
            <input
              type="number"
              value={row.kg}
              onChange={(e) => updateRow(index, { kg: e.target.value })}
              required
              min="0"
              step="0.1"
            />
            <span>kg</span>
            {rows.length > 1 && (
              <button type="button" onClick={() => removeRow(index)}>
                Entfernen
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addRow}>
          Weiteren Bienenstand hinzufügen
        </button>

        <button type="submit" disabled={registerBatch.isPending || receipt.isLoading}>
          {registerBatch.isPending || receipt.isLoading ? 'Charge wird angelegt...' : 'Charge anlegen'}
        </button>
      </form>
    </div>
  )
}

export default NewBatch
