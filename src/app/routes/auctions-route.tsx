import { z } from 'zod'
import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter';
import { rootRoute } from '@/app/routes/root-route'

const aucTypeArray = z
  .preprocess((val) => {
    if (typeof val === 'string') {
      return val ? val.split(',').map((item) => item.trim()) : []
    }
    if (Array.isArray(val)) return val
    return undefined
  }, z.array(z.enum(["Request", "Up", "Down", "FixPrice"])))
  .catch([])

const searchAuctionSchema = z.object({
  page: z.coerce.number().min(1),
  cargo_num: z.coerce.string().optional(),
  status: z.array(z.enum(["NotParticipating", "Leading", "Losing", "OnPending", "Confirmed", "ChoosingWinner", "Winner", "Accepted", "Unknown"])).optional(),
  statuses: z.array(z.number()).optional(),
  auc_type: aucTypeArray.optional(),
  load_city: z.coerce.string().optional(),
  unload_city: z.coerce.string().optional(),
  load_date_from: z.coerce.string().optional(),
  load_date_to: z.coerce.string().optional(),
  is_available: z.coerce.boolean().optional(),
  is_bidder: z.coerce.boolean().optional(),
  price_from: z.coerce.string().optional(),
  price_to: z.coerce.string().optional(),
})

export const auctionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions',
  validateSearch: zodValidator(searchAuctionSchema),
  component: lazyRouteComponent(
    () => import('@/pages/auctions-list/AuctionsListPage'),
    'AuctionsListPage',
  ),
})
