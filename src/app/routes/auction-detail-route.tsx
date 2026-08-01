import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '@/app/routes/root-route'
import { auctionKeys } from '@/entities/auction/api/queries'
import { fetchAuction, NotFoundError } from '@/entities/auction/api/auction-api'
import { betKeys } from '@/entities/bet/api/queries'
import { fetchBets } from '@/entities/bet/api/bet-api'
import { AuctionDetailPage } from '@/pages/auction-detail/AuctionDetailPage'
import { ErrorState } from '@/shared/ui/ErrorState/ErrorState'

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
  component: AuctionDetailPage,
  // Without this, a `NotFoundError` thrown by `fetchAuction` (on a 404 from
  // the mock API) would reject the loader's `Promise.all` and fall through
  // to TanStack Router's generic default error boundary instead of our
  // `ErrorState` component.
  errorComponent: ({ error }) => (
    <div className="app-layout">
      {error instanceof NotFoundError ? (
        <ErrorState title="Аукцион не найден" message={error.message} />
      ) : (
        <ErrorState />
      )}
    </div>
  ),
})
