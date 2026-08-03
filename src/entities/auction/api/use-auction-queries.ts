import { useQuery } from '@tanstack/react-query'
import { fetchAuction, fetchAuctionList } from '@/entities/auction/api/auction-api'
import { auctionKeys } from '@/entities/auction/api/queries'
import type { AuctionsListFilters } from '@/shared/api/types';


export function useAuctionList(page: number, perPage = 10, filters: AuctionsListFilters = {}) {
  return useQuery({
    queryKey: auctionKeys.list({ page, perPage, filters }),
    queryFn: () => fetchAuctionList({ page, per_page: perPage, ...filters }),
  })
}

export function useAuction(uuid: string) {
  return useQuery({
    queryKey: auctionKeys.detail(uuid),
    queryFn: () => fetchAuction(uuid),
    enabled: Boolean(uuid),
  })
}
