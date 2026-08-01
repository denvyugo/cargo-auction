import { createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from '@/app/routes/root-route'

// `/` has no page of its own — it always redirects to the auctions list.
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/auctions' })
  },
})
