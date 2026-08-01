import { delay, http, HttpResponse } from 'msw'
import { auctionStore, syncListItemFromDetail } from '@/shared/mocks/data/store'
import type { AuctionListRequest } from '@/shared/api/types'

const API = '/api/v1'

export const auctionHandlers = [
  http.post(`${API}/auctions/list`, async ({ request }) => {
    await delay(400)

    const body = (await request.json().catch(() => ({}))) as AuctionListRequest
    const page = body.page ?? 1
    const perPage = body.per_page ?? 10
    const total = auctionStore.listItems.length
    const lastPage = Math.max(1, Math.ceil(total / perPage))
    const start = (page - 1) * perPage
    const data = auctionStore.listItems.slice(start, start + perPage)

    return HttpResponse.json({
      data,
      meta: {
        current_page: page,
        from: data.length > 0 ? start + 1 : 0,
        last_page: lastPage,
        per_page: perPage,
        to: start + data.length,
        total,
      },
    })
  }),

  http.get(`${API}/auctions/:auctionUuid`, async ({ params }) => {
    await delay(350)

    const uuid = params.auctionUuid as string
    const detail = auctionStore.details.get(uuid)

    if (!detail) {
      return HttpResponse.json(
        { title: 'Not Found', status: 404, detail: 'Аукцион не найден' },
        { status: 404 },
      )
    }

    return HttpResponse.json(detail)
  }),
]

export const betHandlers = [
  http.get(`${API}/auctions/:auctionUuid/bets`, async ({ params }) => {
    await delay(300)

    const uuid = params.auctionUuid as string
    if (!auctionStore.details.has(uuid)) {
      return HttpResponse.json(
        { title: 'Not Found', status: 404, detail: 'Аукцион не найден' },
        { status: 404 },
      )
    }

    const bets = auctionStore.bets.get(uuid) ?? []
    return HttpResponse.json({ bets })
  }),

  http.post(`${API}/auctions/:auctionUuid/bets`, async ({ params, request }) => {
    await delay(450)

    const uuid = params.auctionUuid as string
    const detail = auctionStore.details.get(uuid)

    if (!detail) {
      return HttpResponse.json(
        { title: 'Not Found', status: 404, detail: 'Аукцион не найден' },
        { status: 404 },
      )
    }

    const body = (await request.json()) as { price?: number }

    if (!body.price || body.price <= 0) {
      return HttpResponse.json(
        {
          title: 'Validation Failed',
          status: 422,
          errors: [{ field: 'price', message: 'Цена должна быть больше 0' }],
        },
        { status: 422 },
      )
    }

    if (!detail.trading.can_set_bet) {
      return HttpResponse.json(
        {
          title: 'Validation Failed',
          status: 422,
          errors: [{ field: 'price', message: 'Ставки в этом аукционе недоступны' }],
        },
        { status: 422 },
      )
    }

    const price = body.price
    const newBet = {
      id: auctionStore.nextBetId++,
      created_at: new Date().toISOString(),
      auction_id: detail.main.id!,
      subscriber_id: 99,
      contact_name: 'Вы',
      contact_phone: '+79009999999',
      price_with_vat: price,
      price_no_vat: Math.round(price / 1.22),
      organization_id: 999,
      organization_inn: '9999999999',
      organization_name: 'Ваша организация',
      is_canceled: false,
      is_your: true,
    }

    const bets = auctionStore.bets.get(uuid) ?? []
    bets.unshift(newBet)
    auctionStore.bets.set(uuid, bets)

    if (detail.trading.price) {
      detail.trading.price.current = price
      detail.trading.price.current_no_vat = Math.round(price / 1.22)
    }
    detail.trading.your = { with_vat: price, no_vat: Math.round(price / 1.22) }
    detail.trading.status_mobile = 'Leading'
    detail.trading.is_bidder = true

    syncListItemFromDetail(uuid)

    return HttpResponse.json({ success: true })
  }),
]
