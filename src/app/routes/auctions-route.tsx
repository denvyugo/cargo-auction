import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '@/app/routes/root-route'
import { AuctionsListPlaceholder } from '@/app/routes/auctions-list-placeholder'

export const auctionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions',
  component: AuctionsListPlaceholder,
})
