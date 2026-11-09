// Some free-tier RPC providers (e.g. Alchemy) cap eth_getLogs to a 10-block range per call.
// We're almost always looking for the most recent occurrence of an event for one batchId, so
// scan backward from the current block instead of forward from the contract's deployment block
// and stop at the first match. A freshly emitted event (the common case right after bottling or
// a retest) then resolves in one or two requests, independent of how old the deployment itself
// is - scanning forward from deployedAtBlock would get slower every day as that range grows,
// even for a batch that was just bottled.
const CHUNK_SIZE = 10n
const MAX_ATTEMPTS = 5

export async function findLastLogInChunks<T>(
  publicClient: { getBlockNumber: () => Promise<bigint> },
  fromBlock: bigint,
  fetchChunk: (from: bigint, to: bigint) => Promise<T[]>,
): Promise<T | undefined> {
  const latest = await publicClient.getBlockNumber()
  let to = latest
  while (to >= fromBlock) {
    const from = to - CHUNK_SIZE + 1n < fromBlock ? fromBlock : to - CHUNK_SIZE + 1n
    let attempt = 0
    for (;;) {
      try {
        const logs = await fetchChunk(from, to)
        if (logs.length > 0) return logs[logs.length - 1]
        break
      } catch (err) {
        attempt += 1
        if (attempt > MAX_ATTEMPTS) throw err
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
      }
    }
    if (from === fromBlock) break
    to = from - 1n
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  return undefined
}

// Caches a found log's data per (chainId, contract, event, batchId) in localStorage, so a batch
// looked up once never needs to be scanned for again in this browser.
export function readLogCache<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch {
    return undefined
  }
}

export function writeLogCache<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore (private browsing, storage full, ...) - just means no caching this time */
  }
}
