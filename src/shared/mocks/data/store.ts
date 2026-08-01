import type {
  AuctionListItem,
  AuctionShowResponse,
  BetItem,
} from '@/shared/api/types'

const CITIES = [
  { name: 'Москва', region: 'Московская обл.' },
  { name: 'Санкт-Петербург', region: 'Ленинградская обл.' },
  { name: 'Екатеринбург', region: 'Свердловская обл.' },
  { name: 'Новосибирск', region: 'Новосибирская обл.' },
  { name: 'Казань', region: 'Респ. Татарстан' },
  { name: 'Краснодар', region: 'Краснодарский край' },
  { name: 'Ростов-на-Дону', region: 'Ростовская обл.' },
  { name: 'Самара', region: 'Самарская обл.' },
]

const AUC_TYPES = ['Request', 'Up', 'Down', 'FixPrice'] as const
const STATUSES = ['Planning', 'Auction', 'DeterminateWinner', 'Finished'] as const
const TRADING_STATUSES = ['NotParticipating', 'Leading', 'Losing', 'Winner'] as const
const ORGANIZERS = ['ЛИМ', 'Делко', 'ТрансЛог', 'ГрузСервис', 'АвтоТранс']

function uuid(index: number): string {
  const hex = index.toString(16).padStart(12, '0')
  return `00000000-0000-4000-8000-${hex}`
}

function createListItem(index: number): AuctionListItem {
  const from = CITIES[index % CITIES.length]
  const to = CITIES[(index + 3) % CITIES.length]
  const aucType = AUC_TYPES[index % AUC_TYPES.length]
  const status = STATUSES[index % STATUSES.length]
  const tradingStatus = TRADING_STATUSES[index % TRADING_STATUSES.length]
  const basePrice = 15000 + (index % 10) * 2500
  const orderUid = uuid(index + 1)

  return {
    main: {
      id: 1000 + index,
      cargo_num: String(10000001000 + index).padStart(11, '0'),
      cargo_date: '2026-06-01T10:00:00',
      auc_type: aucType,
      order_uid: orderUid,
      created_at: '2026-05-25T11:48:20',
      priority_sort: 0,
      is_assembly: index % 7 === 0,
      price_per_km: 120 + index * 5,
    },
    organizer: {
      subscriber_id: 90 + (index % 5),
      organization_id: 340 + index,
      organization_name: ORGANIZERS[index % ORGANIZERS.length],
      organization_inn: '7703769184',
      organization_kpp: '770301001',
      is_hide_organization: false,
    },
    route: {
      from: {
        city: from.name,
        region: from.region,
        address: `ул. Логистическая, ${index + 1}`,
      },
      to: {
        city: to.name,
        region: to.region,
        address: `пр. Транспортный, ${index + 10}`,
      },
    },
    cargo: {
      name: ['Мороженое', 'Стройматериалы', 'Оборудование', 'Продукты', 'Мебель'][index % 5],
      weight: 5 + (index % 15),
      volume: 20 + (index % 40),
      body_type: 'тентованный',
      truck_count: 1,
      is_cargo: true,
    },
    trading: {
      status,
      status_mobile: tradingStatus,
      start_time: '2026-06-01T09:00:00',
      stop_time: '2026-06-01T18:00:00',
      bid_measurement_type: 'PerRoute',
      can_set_bet: status === 'Auction',
      current_price: {
        with_vat: basePrice,
        no_vat: Math.round(basePrice / 1.22),
      },
      your: index % 4 === 0
        ? { with_vat: basePrice - 1000, no_vat: Math.round((basePrice - 1000) / 1.22) }
        : undefined,
    },
    payment: {
      form: 'Безналичная с НДС',
      days: 14,
    },
  }
}

function createDetail(uuidStr: string, listItem: AuctionListItem): AuctionShowResponse {
  const main = listItem.main!
  const organizer = listItem.organizer!
  const route = listItem.route!
  const cargo = listItem.cargo!
  const trading = listItem.trading!
  const currentPrice = trading.current_price?.with_vat ?? 0

  return {
    main: {
      id: main.id!,
      cargo_num: main.cargo_num!,
      cargo_date: main.cargo_date!,
      order_uid: main.order_uid!,
      auc_type: main.auc_type!,
      created_at: main.created_at!,
    },
    organizer: {
      subscriber_id: organizer.subscriber_id!,
      subscriber_code: String(organizer.subscriber_id),
      infobase_code: 'RU_Cargo_01',
      organization_name: organizer.organization_name!,
      organization_inn: organizer.organization_inn!,
      organization_kpp: organizer.organization_kpp!,
      organization_id: organizer.organization_id!,
    },
    contacts: [
      { name: 'Иванов Иван Иванович', phone: '+79001234567', email: 'ivanov@example.com' },
    ],
    cargo: {
      name: cargo.name!,
      weight: cargo.weight!,
      volume: cargo.volume!,
      body_type: cargo.body_type!,
      truck_count: cargo.truck_count!,
      is_cargo: cargo.is_cargo!,
    },
    trading: {
      status: trading.status!,
      status_mobile: trading.status_mobile!,
      start_time: trading.start_time!,
      stop_time: trading.stop_time!,
      bid_measurement_type: trading.bid_measurement_type ?? 'PerRoute',
      can_set_bet: trading.can_set_bet ?? false,
      allow_counter_bets: true,
      hide_bets_history: false,
      hide_places: false,
      no_view_cargo_price: false,
      hide_points_address_and_contacts: false,
      is_bidder: Boolean(trading.your),
      is_favorite: false,
      price: {
        start: currentPrice + 5000,
        start_no_vat: Math.round((currentPrice + 5000) / 1.22),
        current: currentPrice,
        current_no_vat: trading.current_price?.no_vat ?? Math.round(currentPrice / 1.22),
      },
      your: trading.your
        ? {
            with_vat: trading.your.with_vat!,
            no_vat: trading.your.no_vat!,
          }
        : undefined,
      settings: {
        min_step: 500,
        min_step_no_vat: 410,
      },
    },
    payment: {
      form: listItem.payment?.form ?? 'Безналичная с НДС',
      days: listItem.payment?.days ?? 14,
      condition: 'По оригиналам накладных (ТН, ТТН, CMR)',
    },
    assembly: { num: null, date: null },
    routes: [
      {
        type: 'Loading',
        city: route.from?.city ?? '',
        region: route.from?.region ?? '',
        address: route.from?.address ?? '',
        lat: 55.75,
        lng: 37.62,
      },
      {
        type: 'Unloading',
        city: route.to?.city ?? '',
        region: route.to?.region ?? '',
        address: route.to?.address ?? '',
        lat: 59.93,
        lng: 30.31,
      },
    ],
    admitted_organizations: [
      {
        id: 14,
        inn: '9616244307',
        is_main: true,
        name: 'ООО Перевозчик',
        full_name: 'Общество с ограниченной ответственностью Перевозчик',
        subscriber_id: 13,
        subscriber_code: '54321',
        infobase_code: 'RU_Cargo_01',
        hide_me: false,
      },
    ],
    hide_bets_history: uuidStr.endsWith('00000000001c'),
  }
}

function createInitialBets(auctionId: number, basePrice: number, count: number): BetItem[] {
  const bets: BetItem[] = []
  for (let i = 0; i < count; i++) {
    const price = basePrice + (count - i) * 500
    bets.push({
      id: auctionId * 100 + i + 1,
      created_at: new Date(Date.now() - (count - i) * 3600000).toISOString(),
      auction_id: auctionId,
      subscriber_id: 13 + i,
      contact_name: ['Иванов Иван', 'Петров Пётр', 'Сидоров Сидор'][i % 3],
      contact_phone: '+79001234567',
      price_with_vat: price,
      price_no_vat: Math.round(price / 1.22),
      organization_id: 14 + i,
      organization_inn: '9616244307',
      organization_name: ['ООО Перевозчик', 'ООО Логистик', 'ИП Смирнов'][i % 3],
      is_canceled: false,
      is_your: i === count - 1,
    })
  }
  return bets.sort(
    (a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime(),
  )
}

const listItems = Array.from({ length: 30 }, (_, i) => createListItem(i))

export const auctionStore = {
  listItems,
  details: new Map<string, AuctionShowResponse>(
    listItems.map((item) => [
      item.main!.order_uid!,
      createDetail(item.main!.order_uid!, item),
    ]),
  ),
  bets: new Map<string, BetItem[]>(
    listItems.map((item, i) => {
      const uuid = item.main!.order_uid!
      const basePrice = item.trading?.current_price?.with_vat ?? 15000
      const betCount = i % 6
      return [uuid, createInitialBets(item.main!.id!, basePrice, betCount)]
    }),
  ),
  nextBetId: 100000,
}

export function syncListItemFromDetail(uuid: string): void {
  const detail = auctionStore.details.get(uuid)
  const listItem = auctionStore.listItems.find((item) => item.main?.order_uid === uuid)
  if (!detail || !listItem) return

  const current = detail.trading.price?.current
  if (current != null && listItem.trading?.current_price) {
    listItem.trading.current_price.with_vat = current
    listItem.trading.current_price.no_vat = detail.trading.price?.current_no_vat ?? Math.round(current / 1.22)
  }
  if (detail.trading.your && listItem.trading) {
    listItem.trading.your = {
      with_vat: detail.trading.your.with_vat,
      no_vat: detail.trading.your.no_vat,
    }
    listItem.trading.status_mobile = 'Leading'
  }
}
