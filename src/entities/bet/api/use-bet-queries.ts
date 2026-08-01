import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { auctionKeys } from '@/entities/auction/api/queries'
import { fetchBets, setBet } from '@/entities/bet/api/bet-api'
import { betKeys } from '@/entities/bet/api/queries'

export function useBets(auctionUuid: string) {
  return useQuery({
    queryKey: betKeys.list(auctionUuid),
    queryFn: () => fetchBets(auctionUuid),
    enabled: Boolean(auctionUuid),
  })
}

export function useSetBet(auctionUuid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (price: number) => setBet(auctionUuid, { price }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: betKeys.list(auctionUuid) })
      queryClient.invalidateQueries({ queryKey: auctionKeys.detail(auctionUuid) })
    },
  })
}
