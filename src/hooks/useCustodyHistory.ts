import { useChainId, useReadContracts } from 'wagmi'
import { supplyChainAbi } from '../generated'
import { addresses } from '../addresses'

const MAX_TRANSFERS = 10

export type CustodyRecord = { from: `0x${string}`; to: `0x${string}`; timestamp: bigint }

export function useCustodyHistory(batchId: bigint | undefined) {
  const chainId = useChainId()
  const supplyChain = addresses[chainId as keyof typeof addresses]?.SupplyChain

  const { data, isLoading } = useReadContracts({
    contracts: Array.from({ length: MAX_TRANSFERS }, (_, i) => ({
      address: supplyChain,
      abi: supplyChainAbi,
      functionName: 'custodyHistory' as const,
      args: batchId !== undefined ? [batchId, BigInt(i)] as const : undefined,
    })),
    query: { enabled: Boolean(supplyChain && batchId !== undefined) },
  })

  const records: CustodyRecord[] = []
  for (const entry of data ?? []) {
    if (entry.status !== 'success') break
    const [from, timestamp, to] = entry.result as readonly [`0x${string}`, bigint, `0x${string}`]
    records.push({ from, to, timestamp })
  }

  return { records, isLoading }
}
