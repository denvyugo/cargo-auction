import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '@/app/routes/root-route'
import { auctionKeys } from '@/entities/auction/api/queries'
import { fetchAuction } from '@/entities/auction/api/auction-api'
import { betKeys } from '@/entities/bet/api/queries'
import { fetchBets } from '@/entities/bet/api/bet-api'
import { AuctionDetailPlaceholder } from '@/app/routes/auction-detail-placeholder'

export const auctionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions/$auctionUuid',
  loader: async ({ context, params }) => {
    const { queryClient } = context
    await Promise.all([
      queryClient.ensureQueryData({
        queryKey: auctionKeys.detail(params.auctionUuid),
        queryFn: () => fetchAuction(params.auctionUuid),
      }),
      queryClient.ensureQueryData({
        queryKey: betKeys.list(params.auctionUuid),
        queryFn: () => fetchBets(params.auctionUuid),
      }),
    ])
  },
  component: AuctionDetailPlaceholder,
})
