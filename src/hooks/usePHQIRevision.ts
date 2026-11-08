import { useEffect, useState } from 'react'
import { useChainId, usePublicClient } from 'wagmi'
import { parseAbiItem } from 'viem'
import { addresses } from '../addresses'

const PHQI_REVISED_EVENT = parseAbiItem('event PHQIRevised(uint256 indexed batchId, uint256 oldPhqi)')

export function usePHQIRevision(batchId: bigint | undefined) {
  const chainId = useChainId()
  const qualityIndex = addresses[chainId as keyof typeof addresses]?.QualityIndex
  const deployedAtBlock = addresses[chainId as keyof typeof addresses]?.deployedAtBlock
  const publicClient = usePublicClient()

  const [oldPhqi, setOldPhqi] = useState<bigint>()

  useEffect(() => {
    if (!publicClient || !qualityIndex || batchId === undefined) {
      setOldPhqi(undefined)
      return
    }
    let cancelled = false
    publicClient
      .getLogs({
        address: qualityIndex,
        event: PHQI_REVISED_EVENT,
        args: { batchId },
        fromBlock: deployedAtBlock ?? 0n,
      })
      .then((logs) => {
        if (cancelled) return
        if (logs.length === 0) {
          setOldPhqi(undefined)
          return
        }
        setOldPhqi(logs[logs.length - 1].args.oldPhqi)
      })
      .catch(() => {
        if (!cancelled) setOldPhqi(undefined)
      })
    return () => {
      cancelled = true
    }
  }, [publicClient, qualityIndex, batchId, deployedAtBlock])

  return oldPhqi
}
