import { getRouteApi } from '@tanstack/react-router'
import { useAuctionList } from '@/entities/auction/api/use-auction-queries'
import { AuctionCard } from '@/entities/auction/ui/AuctionCard'
import { SkeletonCard } from '@/shared/ui/Skeleton/Skeleton'
import { Pagination } from '@/shared/ui/Pagination/Pagination'
import { ErrorState } from '@/shared/ui/ErrorState/ErrorState'
import './AuctionList.css'

const PER_PAGE = 10
const SKELETON_COUNT = 6

// Reads the typed `page` search param registered by `auctionsRoute`'s
// `validateSearch` without importing the route module directly (avoids a
// circular import: the route imports `pages/auctions-list`, which renders
// this widget).
const auctionsRouteApi = getRouteApi('/auctions')

export function AuctionList() {
  const { page } = auctionsRouteApi.useSearch()
  const navigate = auctionsRouteApi.useNavigate()

  const { data, isLoading, isError, refetch } = useAuctionList(page, PER_PAGE)

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

  const auctions = data.data ?? []

  return (
    <div className="auction-list">
      <div className="auction-list__grid">
        {auctions.map((auction) => (
          <AuctionCard key={auction.main?.order_uid} auction={auction} />
        ))}
      </div>
      <Pagination
        currentPage={data.meta?.current_page ?? page}
        lastPage={data.meta?.last_page ?? 1}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
