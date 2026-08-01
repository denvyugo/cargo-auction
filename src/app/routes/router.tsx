import { createRouter } from '@tanstack/react-router'
import { queryClient } from '@/app/providers/query-client'
import { rootRoute } from '@/app/routes/root-route'
import { indexRoute } from '@/app/routes/index-route'
import { auctionsRoute } from '@/app/routes/auctions-route'
import { auctionDetailRoute } from '@/app/routes/auction-detail-route'

const routeTree = rootRoute.addChildren([indexRoute, auctionsRoute, auctionDetailRoute])

export const router = createRouter({
  routeTree,
  context: { queryClient },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
