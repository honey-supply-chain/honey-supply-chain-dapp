import { useEffect, useState } from 'react'
import { useChainId, usePublicClient } from 'wagmi'
import { parseAbiItem } from 'viem'
import { addresses } from '../addresses'

const BATCH_BOTTLED_EVENT = parseAbiItem('event BatchBottled(uint256 indexed batchId)')

export function useBottledAt(batchId: bigint | undefined) {
  const chainId = useChainId()
  const supplyChain = addresses[chainId as keyof typeof addresses]?.SupplyChain
  const deployedAtBlock = addresses[chainId as keyof typeof addresses]?.deployedAtBlock
  const publicClient = usePublicClient()

  const [timestamp, setTimestamp] = useState<bigint>()

  useEffect(() => {
    if (!publicClient || !supplyChain || batchId === undefined) {
      setTimestamp(undefined)
      return
    }
    let cancelled = false
    publicClient
      .getLogs({
        address: supplyChain,
        event: BATCH_BOTTLED_EVENT,
        args: { batchId },
        fromBlock: deployedAtBlock ?? 0n,
      })
      .then(async (logs) => {
        if (logs.length === 0) {
          if (!cancelled) setTimestamp(undefined)
          return
        }
        const block = await publicClient.getBlock({ blockHash: logs[0].blockHash })
        if (!cancelled) setTimestamp(block.timestamp)
      })
      .catch(() => {
        if (!cancelled) setTimestamp(undefined)
      })
    return () => {
      cancelled = true
    }
  }, [publicClient, supplyChain, batchId, deployedAtBlock])

  return timestamp
}
