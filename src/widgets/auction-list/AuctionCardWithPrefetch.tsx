import type { AuctionListItem } from '@/entities/auction/model/labels'
import { AuctionCard } from '@/entities/auction/ui/AuctionCard'
import { usePrefetchAuction } from '@/features/prefetch-auction-on-hover/usePrefetchAuction'

type AuctionCardWithPrefetchProps = {
  auction: AuctionListItem
}

// Thin per-card wrapper so `usePrefetchAuction` (a hook) can be invoked once
// per list item without calling hooks inside the `.map` loop body in
// `AuctionList`. Keeps `entities/auction/ui/AuctionCard` free of any
// `features`-layer import, preserving the FSD dependency direction.
export function AuctionCardWithPrefetch({ auction }: AuctionCardWithPrefetchProps) {
  const onMouseEnter = usePrefetchAuction(auction.main?.order_uid ?? '')

  return <AuctionCard auction={auction} onMouseEnter={onMouseEnter} />
}
