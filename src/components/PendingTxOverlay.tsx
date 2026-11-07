function PendingTxOverlay({ active, hash }: { active: boolean; hash: `0x${string}` | undefined }) {
  if (!active) return null

  return (
    <div className="pending-tx-overlay" role="alert" aria-live="assertive">
      <div className="pending-tx-overlay-box">
        <span className="spinner" aria-hidden="true" />
        <p>
          {hash
            ? 'Transaktion wird verarbeitet...'
            : 'Bitte bestätige die Transaktion in deiner Wallet.'}
        </p>
      </div>
    </div>
  )
}

export default PendingTxOverlay
