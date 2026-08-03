import { Link } from '@tanstack/react-router'
import type { AuctionListItem } from '@/entities/auction/model/labels'
import { AUC_TYPE_LABELS, STATUS_LABELS } from '@/entities/auction/model/labels'
import { formatPrice } from '@/shared/lib/formatPrice'
import './AuctionCard.css'

type AuctionCardProps = {
  auction: AuctionListItem
  onMouseEnter?: () => void
}

export function AuctionCard({ auction, onMouseEnter }: AuctionCardProps) {
  const { main, organizer, route, trading } = auction

  const orderUid = main?.order_uid ?? ''
  const aucType = main?.auc_type ?? 'Unknown'
  const status = trading?.status ?? 'Unknown'

  return (
    <Link
      to="/auctions/$auctionUuid"
      params={{ auctionUuid: orderUid }}
      className="auction-card"
      onMouseEnter={onMouseEnter}
      onTouchStart={onMouseEnter}
    >
      <div className="auction-card__header">
        <span className="auction-card__type">{AUC_TYPE_LABELS[aucType] ?? aucType}</span>
        <span className="auction-card__status">{STATUS_LABELS[status] ?? status}</span>
      </div>

      <div className="auction-card__route">
        <span className="auction-card__route-point">{route?.load?.city ?? '—'}</span>
        <span className="auction-card__route-arrow" aria-hidden="true">
          →
        </span>
        <span className="auction-card__route-point">{route?.unload?.city ?? '—'}</span>
      </div>

      <div className="auction-card__organizer">{organizer?.organization_name ?? '—'}</div>

      <div className="auction-card__footer">
        <span className="auction-card__price">{formatPrice(trading?.price?.current)}</span>
        <span className="auction-card__cargo-num">№ {main?.cargo_num ?? '—'}</span>
      </div>
    </Link>
  )
}
