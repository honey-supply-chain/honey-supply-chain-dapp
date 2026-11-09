import { useEffect, useRef, useState } from 'react'
import { useChainId, usePublicClient } from 'wagmi'
import { parseAbiItem } from 'viem'
import { addresses } from '../addresses'
import { findLastLogInChunks, readLogCache, writeLogCache } from '../lib/scanLogs'

const PHQI_REVISED_EVENT = parseAbiItem('event PHQIRevised(uint256 indexed batchId, uint256 oldPhqi)')

export function usePHQIRevision(batchId: bigint | undefined) {
  const chainId = useChainId()
  const qualityIndex = addresses[chainId as keyof typeof addresses]?.QualityIndex
  const deployedAtBlock = addresses[chainId as keyof typeof addresses]?.deployedAtBlock
  const publicClient = usePublicClient()

  const [oldPhqi, setOldPhqi] = useState<bigint>()
  const scannedBatchId = useRef<bigint>()

  useEffect(() => {
    if (!publicClient || !qualityIndex || batchId === undefined) {
      setOldPhqi(undefined)
      return
    }
    if (scannedBatchId.current === batchId) return
    scannedBatchId.current = batchId

    const cacheKey = `oldPhqi:${chainId}:${qualityIndex}:${batchId}`
    const cached = readLogCache<string>(cacheKey)
    if (cached !== undefined) {
      setOldPhqi(BigInt(cached))
      return
    }

    const isStillCurrent = () => scannedBatchId.current === batchId

    findLastLogInChunks(publicClient, deployedAtBlock ?? 0n, (from, to) =>
      publicClient.getLogs({ address: qualityIndex, event: PHQI_REVISED_EVENT, args: { batchId }, fromBlock: from, toBlock: to }),
    )
      .then((log) => {
        if (!log) {
          if (isStillCurrent()) setOldPhqi(undefined)
          return
        }
        writeLogCache(cacheKey, log.args.oldPhqi!.toString())
        if (isStillCurrent()) setOldPhqi(log.args.oldPhqi)
      })
      .catch(() => {
        if (isStillCurrent()) {
          setOldPhqi(undefined)
          scannedBatchId.current = undefined
        }
      })
  }, [publicClient, qualityIndex, batchId, deployedAtBlock, chainId])

  return oldPhqi
}
