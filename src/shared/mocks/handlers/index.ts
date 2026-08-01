import { delay, http, HttpResponse } from 'msw'
import { auctionStore, syncListItemFromDetail } from '@/shared/mocks/data/store'
import type { AuctionListRequest, BetItem, SetBetRequest } from '@/shared/api/types'

const API = '/api/v1'

function notFound() {
  return HttpResponse.json(
    {
      code: 'resource_not_found',
      title: 'Не найдено',
      message: 'Аукцион не найден',
    },
    { status: 404, headers: { 'Content-Type': 'application/problem+json' } },
  )
}

function validationFailed(field: string, message: string) {
  return HttpResponse.json(
    {
      code: 'validation_failed',
      title: 'Ошибка валидации',
      message: 'Запрос содержит некорректные поля.',
      errors: [{ field, message }],
    },
    { status: 422, headers: { 'Content-Type': 'application/problem+json' } },
  )
}

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
      return notFound()
    }

    return HttpResponse.json(detail)
  }),
]

export const betHandlers = [
  http.get(`${API}/auctions/:auctionUuid/bets`, async ({ params }) => {
    await delay(300)

    const uuid = params.auctionUuid as string
    if (!auctionStore.details.has(uuid)) {
      return notFound()
    }

    const bets = auctionStore.bets.get(uuid) ?? []
    return HttpResponse.json({ bets })
  }),

  http.post(`${API}/auctions/:auctionUuid/bets`, async ({ params, request }) => {
    await delay(450)

    const uuid = params.auctionUuid as string
    const detail = auctionStore.details.get(uuid)

    if (!detail) {
      return notFound()
    }

    const body = (await request.json().catch(() => ({}))) as Partial<SetBetRequest>

    if (!body.price || body.price <= 0) {
      return validationFailed('price', 'Цена должна быть больше 0')
    }

    if (!detail.trading.can_set_bet) {
      return validationFailed('price', 'Ставки в этом аукционе недоступны')
    }

    const price = body.price
    const priceNoVat = Math.round((price / 1.2) * 100) / 100
    const newBet: BetItem = {
      id: auctionStore.nextBetId++,
      created_at: new Date().toISOString(),
      auction_id: detail.main.id!,
      subscriber_id: 99,
      contact_name: 'Вы',
      contact_phone: '+79009999999',
      price_with_vat: price,
      price_no_vat: priceNoVat,
      organization_id: 999,
      organization_inn: '9999999999',
      organization_name: 'Ваша организация',
      transporter_comment: null,
      is_rejected: false,
      is_counter: false,
      place: 1,
      is_win: false,
      run_number: 0,
      cancel_reason: '',
      price_info: {
        price_with_vat: price,
        price_no_vat: priceNoVat,
        payment_type: 'Безналичная с НДС',
        vat_rate: '20',
      },
    }

    const bets = auctionStore.bets.get(uuid) ?? []
    bets.unshift(newBet)
    auctionStore.bets.set(uuid, bets)

    if (detail.trading.price) {
      detail.trading.price.current = price
      detail.trading.price.current_no_vat = priceNoVat
    }
    detail.trading.your = {
      bet: true,
      last_bet: price,
      last_bet_with_vat: price,
      win: false,
    }
    detail.trading.status_mobile = 'Leading'
    detail.trading.is_bidder = true

    syncListItemFromDetail(uuid)

    return new HttpResponse(null, { status: 200 })
  }),
]
