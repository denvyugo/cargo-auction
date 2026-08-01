import { useQuery } from '@tanstack/react-query'
import { fetchAuction, fetchAuctionList } from '@/entities/auction/api/auction-api'
import { auctionKeys } from '@/entities/auction/api/queries'

export function useAuctionList(page: number, perPage = 10) {
  return useQuery({
    queryKey: auctionKeys.list({ page, perPage }),
    queryFn: () => fetchAuctionList({ page, per_page: perPage }),
  })
}

export function useAuction(uuid: string) {
  return useQuery({
    queryKey: auctionKeys.detail(uuid),
    queryFn: () => fetchAuction(uuid),
    enabled: Boolean(uuid),
  })
}
