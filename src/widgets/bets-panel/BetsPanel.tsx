import { useAuction } from '@/entities/auction/api/use-auction-queries'
import { useBets } from '@/entities/bet/api/use-bet-queries'
import { PlaceBetForm } from '@/features/place-bet/PlaceBetForm'
import { formatDate } from '@/shared/lib/formatDate'
import { formatPrice } from '@/shared/lib/formatPrice'
import { ErrorState } from '@/shared/ui/ErrorState/ErrorState'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import './BetsPanel.css'

type BetsPanelProps = {
  auctionUuid: string
}

export function BetsPanel({ auctionUuid }: BetsPanelProps) {
  // Dedupes with the `useAuction` call in `AuctionDetailCard` via the shared
  // `auctionKeys.detail(auctionUuid)` query key — no extra network request,
  // just reads `hide_bets_history` off the same cached response.
  const { data: auction } = useAuction(auctionUuid)
  const { data, isLoading, isError, refetch } = useBets(auctionUuid)

  const hideBetsHistory = auction?.hide_bets_history === true

  return (
    <section className="bets-panel">
      <h2>Ставки</h2>

      <PlaceBetForm auctionUuid={auctionUuid} />

      {hideBetsHistory ? (
        <p className="bets-panel__hidden">История ставок скрыта</p>
      ) : isLoading ? (
        <div className="bets-panel__skeleton">
          <Skeleton height="2.5rem" />
          <Skeleton height="2.5rem" />
          <Skeleton height="2.5rem" />
        </div>
      ) : isError || !data ? (
        <ErrorState message="Не удалось загрузить список ставок" onRetry={() => refetch()} />
      ) : data.bets.length === 0 ? (
        <p className="bets-panel__empty">Ставок пока нет</p>
      ) : (
        <table className="bets-panel__table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Контакт</th>
              <th>Цена с НДС</th>
              <th>Цена без НДС</th>
            </tr>
          </thead>
          <tbody>
            {data.bets.map((bet, index) => (
              <tr key={bet.id ?? index} className={bet.is_win ? 'bets-panel__row--win' : undefined}>
                <td>{formatDate(bet.created_at)}</td>
                <td>{bet.contact_name ?? '—'}</td>
                <td>{formatPrice(bet.price_with_vat)}</td>
                <td>{formatPrice(bet.price_no_vat)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
