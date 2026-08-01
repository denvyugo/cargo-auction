import { useQueryClient } from '@tanstack/react-query'
import { fetchAuction } from '@/entities/auction/api/auction-api'
import { auctionKeys } from '@/entities/auction/api/queries'

const PREFETCH_STALE_TIME = 30_000

export function usePrefetchAuction(uuid: string) {
  const queryClient = useQueryClient()

  function onMouseEnter() {
    void queryClient.prefetchQuery({
      queryKey: auctionKeys.detail(uuid),
      queryFn: () => fetchAuction(uuid),
      staleTime: PREFETCH_STALE_TIME,
    })
  }

  return onMouseEnter
}
