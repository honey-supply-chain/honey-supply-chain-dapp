import { useEffect, useState } from 'react'
import { useChainId } from 'wagmi'
import { useReadQualityIndexOriginCid } from '../generated'
import { addresses } from '../addresses'
import { bytes32ToCid } from '../lib/cid'

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/'

export function useOriginPlaces(batchId: bigint | undefined) {
  const chainId = useChainId()
  const qualityIndex = addresses[chainId as keyof typeof addresses]?.QualityIndex

  const { data: originCidHash } = useReadQualityIndexOriginCid({
    address: qualityIndex,
    args: batchId !== undefined ? [batchId] : undefined,
    query: { enabled: Boolean(qualityIndex && batchId !== undefined) },
  })
  const originCid = bytes32ToCid(originCidHash)

  const [places, setPlaces] = useState<string[]>()

  useEffect(() => {
    if (!originCid) {
      setPlaces(undefined)
      return
    }
    let cancelled = false
    fetch(IPFS_GATEWAY + originCid)
      .then((response) => response.json())
      .then((data: { regions?: string[] }) => {
        if (!cancelled) setPlaces(data.regions ?? [])
      })
      .catch(() => {
        if (!cancelled) setPlaces(undefined)
      })
    return () => {
      cancelled = true
    }
  }, [originCid])

  return places
}
