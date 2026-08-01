import { AUC_TYPE_LABELS, OP_TYPE_LABELS, STATUS_LABELS } from '@/entities/auction/model/labels'
import { useAuction } from '@/entities/auction/api/use-auction-queries'
import { formatDate } from '@/shared/lib/formatDate'
import { formatPrice } from '@/shared/lib/formatPrice'
import { ErrorState } from '@/shared/ui/ErrorState/ErrorState'
import { SkeletonCard } from '@/shared/ui/Skeleton/Skeleton'
import './AuctionDetailCard.css'

type AuctionDetailCardProps = {
  auctionUuid: string
}

export function AuctionDetailCard({ auctionUuid }: AuctionDetailCardProps) {
  const { data, isLoading, isError, refetch } = useAuction(auctionUuid)

  if (isLoading) {
    return (
      <div className="auction-detail-card">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  // Defense in depth only: 404s are expected to be caught by the route's
  // `errorComponent` (see `auction-detail-route.tsx`), which shows the same
  // `ErrorState` before this widget ever mounts. This branch only covers
  // non-404 failures on a refetch after the initial successful load.
  if (isError || !data) {
    return <ErrorState message="Не удалось загрузить данные аукциона" onRetry={() => refetch()} />
  }

  const { main, organizer, cargo, trading, payment, routes } = data
  const aucType = main?.auc_type ?? 'Unknown'
  const status = trading?.status ?? 'Unknown'
  // `AuctionShowCargo` itself only carries logistics/pricing fields
  // (truck_count, body_type, distance, ...) — the physical weight/volume/name
  // of the freight live on each route point's `cargo` instead, so we read
  // them from the first route point (loading point) here.
  const routeCargo = routes?.[0]?.cargo

  return (
    <div className="auction-detail-card">
      <section className="auction-detail-card__section">
        <h2>Заявка № {main?.cargo_num ?? '—'}</h2>
        <dl className="auction-detail-card__grid">
          <div>
            <dt>Тип аукциона</dt>
            <dd>{AUC_TYPE_LABELS[aucType] ?? aucType}</dd>
          </div>
          <div>
            <dt>Дата создания</dt>
            <dd>{formatDate(main?.created_at)}</dd>
          </div>
        </dl>
      </section>

      <section className="auction-detail-card__section">
        <h2>Организатор</h2>
        <dl className="auction-detail-card__grid">
          <div>
            <dt>Организация</dt>
            <dd>{organizer?.organization_name ?? '—'}</dd>
          </div>
          <div>
            <dt>ИНН / КПП</dt>
            <dd>
              {organizer?.organization_inn ?? '—'} / {organizer?.organization_kpp ?? '—'}
            </dd>
          </div>
        </dl>
      </section>

      <section className="auction-detail-card__section">
        <h2>Груз</h2>
        <dl className="auction-detail-card__grid">
          <div>
            <dt>Наименование</dt>
            <dd>{routeCargo?.name ?? '—'}</dd>
          </div>
          <div>
            <dt>Вес</dt>
            <dd>{routeCargo?.weight ? `${routeCargo.weight} т` : '—'}</dd>
          </div>
          <div>
            <dt>Объём</dt>
            <dd>{routeCargo?.volume ? `${routeCargo.volume} м³` : '—'}</dd>
          </div>
          <div>
            <dt>Тип кузова</dt>
            <dd>{cargo?.body_type ?? '—'}</dd>
          </div>
          <div>
            <dt>Кол-во ТС</dt>
            <dd>{cargo?.truck_count ?? '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="auction-detail-card__section">
        <h2>Маршрут</h2>
        <ol className="auction-detail-card__routes">
          {(routes ?? []).map((point, index) => (
            <li key={index} className="auction-detail-card__route-point">
              <span className="auction-detail-card__route-op">
                {OP_TYPE_LABELS[point.op_type ?? 'Unknown'] ?? point.op_type}
              </span>
              <span className="auction-detail-card__route-city">
                {point.location?.city_name ?? '—'}
                {point.location?.loading_address ? `, ${point.location.loading_address}` : ''}
              </span>
              <span className="auction-detail-card__route-dates">
                {formatDate(point.start_date)} — {formatDate(point.end_date)}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="auction-detail-card__section">
        <h2>Торги</h2>
        <dl className="auction-detail-card__grid">
          <div>
            <dt>Статус</dt>
            <dd>{STATUS_LABELS[status] ?? status}</dd>
          </div>
          <div>
            <dt>Начало / окончание</dt>
            <dd>
              {formatDate(trading?.start_time)} — {formatDate(trading?.stop_time)}
            </dd>
          </div>
          <div>
            <dt>Текущая цена</dt>
            <dd>{formatPrice(trading?.price?.current)}</dd>
          </div>
          <div>
            <dt>Текущая цена без НДС</dt>
            <dd>{formatPrice(trading?.price?.current_no_vat)}</dd>
          </div>
          {trading?.your?.bet && (
            <div>
              <dt>Ваша ставка</dt>
              <dd>{formatPrice(trading.your.last_bet_with_vat ?? trading.your.last_bet)}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="auction-detail-card__section">
        <h2>Оплата</h2>
        <dl className="auction-detail-card__grid">
          <div>
            <dt>Форма оплаты</dt>
            <dd>{payment?.form ?? '—'}</dd>
          </div>
          <div>
            <dt>Валюта</dt>
            <dd>{payment?.currency_code ?? '—'}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
