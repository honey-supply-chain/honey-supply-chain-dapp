import { useEffect, useRef, useState } from 'react'
import { useChainId, usePublicClient } from 'wagmi'
import { parseAbiItem } from 'viem'
import { addresses } from '../addresses'
import { findLastLogInChunks, readLogCache, writeLogCache } from '../lib/scanLogs'

const BATCH_BOTTLED_EVENT = parseAbiItem('event BatchBottled(uint256 indexed batchId)')

export function useBottledAt(batchId: bigint | undefined) {
  const chainId = useChainId()
  const supplyChain = addresses[chainId as keyof typeof addresses]?.SupplyChain
  const deployedAtBlock = addresses[chainId as keyof typeof addresses]?.deployedAtBlock
  const publicClient = usePublicClient()

  const [timestamp, setTimestamp] = useState<bigint>()
  const [isLoading, setIsLoading] = useState(false)
  const scannedBatchId = useRef<bigint>()

  useEffect(() => {
    if (!publicClient || !supplyChain || batchId === undefined) {
      setTimestamp(undefined)
      setIsLoading(false)
      return
    }
    if (scannedBatchId.current === batchId) return
    scannedBatchId.current = batchId

    const cacheKey = `bottledAt:${chainId}:${supplyChain}:${batchId}`
    const cached = readLogCache<string>(cacheKey)
    if (cached !== undefined) {
      setTimestamp(BigInt(cached))
      return
    }

    const isStillCurrent = () => scannedBatchId.current === batchId

    setIsLoading(true)
    findLastLogInChunks(publicClient, deployedAtBlock ?? 0n, (from, to) =>
      publicClient.getLogs({ address: supplyChain, event: BATCH_BOTTLED_EVENT, args: { batchId }, fromBlock: from, toBlock: to }),
    )
      .then(async (log) => {
        if (!log) {
          if (isStillCurrent()) setTimestamp(undefined)
          return
        }
        const block = await publicClient.getBlock({ blockHash: log.blockHash })
        writeLogCache(cacheKey, block.timestamp.toString())
        if (isStillCurrent()) setTimestamp(block.timestamp)
      })
      .catch(() => {
        if (isStillCurrent()) {
          setTimestamp(undefined)
          scannedBatchId.current = undefined
        }
      })
      .finally(() => {
        if (isStillCurrent()) setIsLoading(false)
      })
  }, [publicClient, supplyChain, batchId, deployedAtBlock, chainId])

  return { timestamp, isLoading }
}
