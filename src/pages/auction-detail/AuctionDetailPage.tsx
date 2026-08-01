import { getRouteApi, Link } from '@tanstack/react-router'
import { AuctionDetailCard } from '@/widgets/auction-detail-card/AuctionDetailCard'
import { BetsPanel } from '@/widgets/bets-panel/BetsPanel'

// Reads `auctionUuid` from the route params registered by
// `auctionDetailRoute` without importing the route module directly (avoids a
// circular import: the route imports this page as its `component`). Mirrors
// the `getRouteApi('/auctions')` pattern used by `widgets/auction-list`.
const auctionDetailRouteApi = getRouteApi('/auctions/$auctionUuid')

export function AuctionDetailPage() {
  const { auctionUuid } = auctionDetailRouteApi.useParams()

  return (
    <div className="app-layout">
      <header className="app-layout__header page-header">
        <h1 className="app-layout__title">Детали аукциона</h1>
        <Link to="/auctions" search={{ page: 1 }} className="page-header__back">
          ← К списку аукционов
        </Link>
      </header>
      <main className="app-layout__main">
        <AuctionDetailCard auctionUuid={auctionUuid} />
        <BetsPanel auctionUuid={auctionUuid} />
      </main>
    </div>
  )
}
