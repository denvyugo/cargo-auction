import { getRouteApi } from '@tanstack/react-router'
import { useAuctionList } from '@/entities/auction/api/use-auction-queries'
import { SkeletonCard } from '@/shared/ui/Skeleton/Skeleton'
import { Pagination } from '@/shared/ui/Pagination/Pagination'
import { ErrorState } from '@/shared/ui/ErrorState/ErrorState'
import { AuctionCardWithPrefetch } from '@/widgets/auction-list/AuctionCardWithPrefetch'
import './AuctionList.css'
import { useState } from 'react';
import { AUC_TYPE_LABELS } from '@/entities/auction/model/labels';

const PER_PAGE = 10
const SKELETON_COUNT = 6

// Reads the typed `page` search param registered by `auctionsRoute`'s
// `validateSearch` without importing the route module directly (avoids a
// circular import: the route imports `pages/auctions-list`, which renders
// this widget).
const auctionsRouteApi = getRouteApi('/auctions')

export function AuctionList() {
  const { page, ...rest } = auctionsRouteApi.useSearch()
  const navigate = auctionsRouteApi.useNavigate()
  const [aucTypes, setAucTypes] = useState<string[]>([])

  const { data, isLoading, isError, refetch } = useAuctionList(page, PER_PAGE, { ...rest })

  function handlePageChange(nextPage: number) {
    navigate({ search: (prev) => ({ ...prev, page: nextPage }) })
  }

  if (isLoading) {
    return (
      <div className="auction-list__grid">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return <ErrorState message="Не удалось загрузить список аукционов" onRetry={() => refetch()} />
  }

  const handlerCargoNum = (e: React.ChangeEvent<HTMLInputElement>) => {
    navigate({ search: (prev) => {
      if (e.target.value) return ({ ...prev, cargo_num: e.target.value })
      else return ({ ...prev, cargo_num: undefined })
    } })
  }

  const handleAucTypeSelect = (event: { target: { selectedOptions: Iterable<unknown> | ArrayLike<unknown>; }; }) => {
    // Convert the HTMLCollection to a standard array
    const options = Array.from(event.target.selectedOptions);
    const values = options.map((option: unknown) => {
      if (option instanceof HTMLOptionElement) {
        return option.value;
      }
      else {
        throw new Error('Invalid option type');
      }
    });
    
    setAucTypes(values);
    navigate({ search: (prev) => {
      const search = { ...rest };
      values.forEach((value) => {
        if (search.auc_type) {
          if (!search.auc_type.includes(value as "Request" | "Up" | "Down" | "FixPrice")) {
            search.auc_type = [...search.auc_type, value as "Request" | "Up" | "Down" | "FixPrice"];
          }
        } else {
          search.auc_type = [value as "Request" | "Up" | "Down" | "FixPrice"];
        }
      });
      return { ...prev, auc_type: search.auc_type };
    } });
  };

  const auctions = data.data ?? []

  return (
    <div className="auction-list">
      <div className="auction-list__search">
          <label className="auction-list__search-label" htmlFor="auction-list__cargo_num">
            №:&nbsp;
          </label>
          <input
            id="auction-list__cargo_num"
            className="auction-list__search-input"
            type="text"
            value={rest.cargo_num ?? ''}
            onChange={handlerCargoNum}
          />
          <label className="auction-list__search-label" htmlFor="auction-list__search-input">
            Наименование:&nbsp;
          </label>
          <select
            id="auction-list__auc-type"
            className="auction-list__search-input"
            multiple
            value={aucTypes}
            onChange={handleAucTypeSelect}
          >
            {Object.keys(AUC_TYPE_LABELS).map((aucType) => (
              <option key={aucType} value={aucType}>{AUC_TYPE_LABELS[aucType] ?? aucType}</option>
            ))}
          </select>
        </div>
      {auctions.length === 0 ? (
        <p className="auction-list__empty">Аукционов не найдено</p>
      ) : (
        <div className="auction-list__grid">
          {auctions.map((auction) => (
            <AuctionCardWithPrefetch key={auction.main?.order_uid} auction={auction} />
          ))}
        </div>
      )}
      <Pagination
        currentPage={data.meta?.current_page ?? page}
        lastPage={data.meta?.last_page ?? 1}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
