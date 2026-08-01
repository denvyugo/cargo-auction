import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '@/app/routes/root-route'
import { AuctionsListPage } from '@/pages/auctions-list/AuctionsListPage'

type AuctionsSearch = {
  page: number
}

function parsePage(value: unknown): number {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

export const auctionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions',
  validateSearch: (search: Record<string, unknown>): AuctionsSearch => ({
    page: parsePage(search.page),
  }),
  component: AuctionsListPage,
})
