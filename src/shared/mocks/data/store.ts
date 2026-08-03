import type {
  AuctionListItem,
  AuctionShowResponse,
  BetItem,
} from '@/shared/api/types'

interface CityInfo {
  name: string
  fullName: string
  gcId: number
  lat: number
  lon: number
}

export const CITIES: CityInfo[] = [
  { name: 'Москва', fullName: 'Москва, Россия', gcId: 213, lat: 55.751244, lon: 37.618423 },
  { name: 'Санкт-Петербург', fullName: 'Санкт-Петербург, Россия', gcId: 2, lat: 59.938784, lon: 30.314997 },
  { name: 'Екатеринбург', fullName: 'Екатеринбург, Россия', gcId: 54, lat: 56.838011, lon: 60.597465 },
  { name: 'Новосибирск', fullName: 'Новосибирск, Россия', gcId: 65, lat: 55.008352, lon: 82.935733 },
  { name: 'Казань', fullName: 'Казань, Россия', gcId: 43, lat: 55.796127, lon: 49.106414 },
  { name: 'Краснодар', fullName: 'Краснодар, Россия', gcId: 35, lat: 45.03547, lon: 38.975313 },
  { name: 'Ростов-на-Дону', fullName: 'Ростов-на-Дону, Россия', gcId: 39, lat: 47.222531, lon: 39.718705 },
  { name: 'Самара', fullName: 'Самара, Россия', gcId: 51, lat: 53.195538, lon: 50.101783 },
  { name: 'Пермь', fullName: 'Пермь, Россия', gcId: 59, lat: 58.010374, lon: 56.229443 },
  { name: 'Воронеж', fullName: 'Воронеж, Россия', gcId: 193, lat: 51.660781, lon: 39.200269 },
]

const AUC_TYPES = ['Request', 'Up', 'Down', 'FixPrice', 'Unknown'] as const
const STATUSES = [
  'Planning',
  'Auction',
  'DeterminateWinner',
  'WaitDeal',
  'InProgress',
  'Finished',
  'Stopped',
  'Canceled',
] as const
const TRADING_STATUSES = ['NotParticipating', 'Leading', 'Losing', 'Winner', 'Confirmed'] as const
const BODY_TYPES = ['тентованный', 'изотермический', 'рефрижератор', 'фургон', 'открытая площадка']
const CARGO_NAMES = ['Мороженое', 'Стройматериалы', 'Оборудование', 'Продукты питания', 'Мебель', 'Бытовая техника']
const ORGANIZERS = ['ЛИМ', 'Делко', 'ТрансЛог', 'ГрузСервис', 'АвтоТранс']
const CONTACT_NAMES = ['Иванов Иван', 'Петров Пётр', 'Сидоров Сидор', 'Кузнецов Алексей', 'Смирнов Олег']
const BET_ORGANIZATIONS = ['ООО Перевозчик', 'ООО Логистик', 'ИП Смирнов', 'ООО ТрансКарго']

function uuid(index: number): string {
  const hex = index.toString(16).padStart(12, '0')
  return `00000000-0000-4000-8000-${hex}`
}

function pad11(n: number): string {
  return String(n).padStart(11, '0')
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function withoutVat(priceWithVat: number): number {
  return round2(priceWithVat / 1.2)
}

function createListItem(index: number): AuctionListItem {
  const loadCity = CITIES[index % CITIES.length]
  const unloadCity = CITIES[(index + 4) % CITIES.length]
  const aucType = AUC_TYPES[index % AUC_TYPES.length]
  const status = STATUSES[index % STATUSES.length]
  const tradingStatus = TRADING_STATUSES[index % TRADING_STATUSES.length]
  const bodyType = BODY_TYPES[index % BODY_TYPES.length]
  const cargoName = CARGO_NAMES[index % CARGO_NAMES.length]
  const orderUid = uuid(index + 1)
  const basePrice = 15000 + (index % 12) * 2500
  const currentPrice = aucType === 'Down' ? basePrice - (index % 5) * 300 : basePrice + (index % 5) * 300
  const canSetBet = status === 'Auction'
  const hasOwnBet = canSetBet && index % 4 === 0
  const hasCarRequirements = index % 3 !== 0

  return {
    main: {
      id: 1000 + index,
      cargo_num: pad11(10000001000 + index),
      cargo_date: '2026-06-01T10:00:00',
      auc_type: aucType,
      order_uid: orderUid,
      created_at: '2026-05-25T11:48:20',
      priority_sort: index % 3,
      is_assembly: index % 7 === 0,
      price_per_km: 100 + (index % 15) * 8,
    },
    organizer: {
      subscriber_id: 90 + (index % 5),
      organization_id: 340 + index,
      organization_name: ORGANIZERS[index % ORGANIZERS.length],
      organization_inn: '7703769184',
      organization_kpp: '770301001',
      is_hide_organization: index % 9 === 0,
    },
    route: {
      load: {
        city: loadCity.name,
        address: `ул. Логистическая, ${index + 1}`,
        date: '2026-06-01T09:00:00',
        city_gc_id: loadCity.gcId,
        points_count: 1,
      },
      unload: {
        city: unloadCity.name,
        address: `пр. Транспортный, ${index + 10}`,
        date: '2026-06-02T12:00:00',
        city_gc_id: unloadCity.gcId,
        points_count: 1,
      },
    },
    cargo: {
      name: cargoName,
      weight: 5 + (index % 15),
      volume: 20 + (index % 40),
      body_type: bodyType,
      truck_count: 1 + (index % 3),
      is_cargo: true,
      is_international: index % 8 === 0,
      containered: index % 6 === 0,
      loading_types: {
        side: index % 2 === 0,
        top: false,
        rear: true,
        full: index % 5 === 0,
      },
      docs: {
        tir: index % 8 === 0,
        cmr: index % 3 === 0,
        t1: false,
        med: index % 10 === 0,
      },
      car: hasCarRequirements
        ? {
            type: 'Тягач',
            weight: 20,
            volume: 82,
            width: 2.4,
            length: 13.6,
            height: 2.7,
          }
        : null,
    },
    trading: {
      status,
      status_mobile: tradingStatus,
      start_time: '2026-06-01T09:00:00',
      stop_time: '2026-06-01T18:00:00',
      bid_measurement_type: index % 5 === 0 ? 'PerKm' : 'PerRoute',
      can_set_bet: canSetBet,
      allow_counter_bets: index % 4 !== 0,
      hide_points_address_and_contacts: index % 6 === 0,
      is_bidder: hasOwnBet,
      is_available: canSetBet,
      is_accredited: index % 3 === 0,
      is_favorite: index % 9 === 1,
      price: {
        start: basePrice,
        current: currentPrice,
        current_no_vat: withoutVat(currentPrice),
      },
      your: hasOwnBet ? { bet: true, last_bet: currentPrice - 500 } : { bet: false, last_bet: null },
      red_bet_with_vat: false,
      red_bet_no_vat: false,
      is_last_bet_with_vat: hasOwnBet,
    },
    payment: {
      form: 'Безналичная с НДС',
      currency_code: '643',
      consignor: index % 4 === 0 ? ORGANIZERS[(index + 1) % ORGANIZERS.length] : undefined,
      consignee: index % 5 === 0 ? ORGANIZERS[(index + 2) % ORGANIZERS.length] : undefined,
    },
  }
}

function createDetail(listItem: AuctionListItem, index: number): AuctionShowResponse {
  const main = listItem.main!
  const organizer = listItem.organizer!
  const route = listItem.route!
  const trading = listItem.trading!
  const cargoList = listItem.cargo!
  const price = trading.price!
  const loadCity = CITIES.find((c) => c.name === route.load?.city) ?? CITIES[0]
  const unloadCity = CITIES.find((c) => c.name === route.unload?.city) ?? CITIES[1]
  const distance = 300 + (index % 20) * 150
  const hasOwnBet = Boolean(trading.your?.bet)
  const start = price.start ?? 0

  return {
    main: {
      id: main.id!,
      cargo_num: main.cargo_num!,
      cargo_date: main.cargo_date!,
      order_uid: main.order_uid!,
      auc_type: main.auc_type,
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
      { name: 'Иванов Иван Иванович', phone: '+79001234567', work_phone: null, uid: null, email: 'ivanov@example.com' },
    ],
    cargo: {
      price: String(price.current ?? 0),
      currency: 643,
      is_international: cargoList.is_international ?? false,
      distance,
      truck_count: cargoList.truck_count ?? 1,
      body_type: cargoList.body_type,
      temp_from: null,
      temp_to: null,
      conics: null,
      belts: null,
      adr: null,
      coupling: null,
      air_pass: null,
      low_loader: null,
      additional_load: null,
      containered: cargoList.containered ?? false,
      container_type: null,
      container_size: null,
      loading_types: cargoList.loading_types,
      docs: cargoList.docs,
      car: cargoList.car ?? null,
    },
    trading: {
      status: trading.status,
      status_mobile: trading.status_mobile,
      start_time: trading.start_time!,
      stop_time: trading.stop_time!,
      bid_measurement_type: trading.bid_measurement_type ?? 'PerRoute',
      can_set_bet: trading.can_set_bet ?? false,
      allow_counter_bets: trading.allow_counter_bets ?? true,
      hide_bets_history: index % 11 === 0,
      hide_places: index % 13 === 0,
      no_view_cargo_price: index % 10 === 0,
      hide_points_address_and_contacts: trading.hide_points_address_and_contacts ?? false,
      is_bidder: hasOwnBet,
      is_favorite: trading.is_favorite ?? false,
      is_last_bet_with_vat: hasOwnBet ? true : null,
      red_bet_with_vat: false,
      red_bet_no_vat: false,
      send_deal_before_load: false,
      chat_id: null,
      price: {
        start,
        start_no_vat: withoutVat(start),
        current: price.current ?? null,
        current_no_vat: price.current_no_vat ?? null,
        available: price.current ?? null,
        available_no_vat: price.current_no_vat ?? null,
        min: round2(start * 0.6),
        min_no_vat: withoutVat(round2(start * 0.6)),
        max: start,
        max_no_vat: withoutVat(start),
        step: 500,
        step_no_vat: withoutVat(500),
        price_per_km:
          distance > 0 && price.current_no_vat != null ? round2(price.current_no_vat / distance) : 0,
      },
      your: {
        bet: hasOwnBet,
        last_bet: trading.your?.last_bet ?? null,
        last_bet_with_vat: trading.your?.last_bet ?? null,
        win: hasOwnBet && trading.status === 'Finished',
      },
      settings: {
        prolong_after_bet: 10,
        winner_confirm: 1,
        winner_counter_mode: null,
        transmission_time_in: 24,
        coefficient: 10,
      },
    },
    payment: {
      condition: 'По оригиналам накладных (ТН, ТТН, CMR)',
      condition_predefined: 'ПоОригиналамНаладных',
      form: listItem.payment?.form ?? 'Безналичная с НДС',
      delay: 14,
      delay_type: 'CalendarDays',
      currency_code: listItem.payment?.currency_code ?? '643',
      prepay: null,
    },
    assembly: { num: null, date: null },
    routes: [
      {
        row_num: 1,
        op_type: 'Loading',
        start_date: route.load?.date ?? '2026-06-01T09:00:00',
        end_date: route.load?.date ?? '2026-06-01T09:00:00',
        comment: null,
        contractor: '',
        contractor_inn: '',
        location: {
          city_name: loadCity.name,
          city_full_name: loadCity.fullName,
          city_gc_id: loadCity.gcId,
          loading_address: route.load?.address ?? '',
          lon: loadCity.lon,
          lat: loadCity.lat,
        },
        cargo: {
          name: cargoList.name ?? '',
          package_name: '',
          weight: (cargoList.weight ?? 0).toFixed(3),
          volume: (cargoList.volume ?? 0).toFixed(3),
          length: '0',
          width: '0',
          height: '0',
          oversized: false,
          package_amount: null,
        },
        contact: { name: '', phone: '' },
      },
      {
        row_num: 2,
        op_type: 'Unloading',
        start_date: route.unload?.date ?? '2026-06-02T12:00:00',
        end_date: route.unload?.date ?? '2026-06-02T12:00:00',
        comment: null,
        contractor: '',
        contractor_inn: '',
        location: {
          city_name: unloadCity.name,
          city_full_name: unloadCity.fullName,
          city_gc_id: unloadCity.gcId,
          loading_address: route.unload?.address ?? '',
          lon: unloadCity.lon,
          lat: unloadCity.lat,
        },
        cargo: {
          name: cargoList.name ?? '',
          package_name: '',
          weight: (cargoList.weight ?? 0).toFixed(3),
          volume: (cargoList.volume ?? 0).toFixed(3),
          length: '0',
          width: '0',
          height: '0',
          oversized: false,
          package_amount: null,
        },
        contact: { name: '', phone: '' },
      },
    ],
    admitted_organizations:
      index % 4 !== 0
        ? [
            {
              id: 14 + index,
              inn: '9616244307',
              is_main: true,
              name: 'ООО Перевозчик',
              full_name: 'Общество с ограниченной ответственностью Перевозчик',
              site: null,
              subscriber_id: 13,
              subscriber_code: '54321',
              subscriber_role: null,
              infobase_code: 'RU_Cargo_01',
              infobase_address: null,
              nalog_key: null,
              hide_me: false,
              current_vat_rate: '20',
            },
          ]
        : [],
    hide_bets_history: index % 11 === 0,
  }
}

function createBet(auctionId: number, index: number, priceWithVat: number, isWinner: boolean): BetItem {
  const priceNoVat = withoutVat(priceWithVat)
  return {
    id: auctionId * 100 + index + 1,
    created_at: new Date(Date.now() - (index + 1) * 3_600_000).toISOString(),
    auction_id: auctionId,
    subscriber_id: 13 + index,
    contact_name: CONTACT_NAMES[index % CONTACT_NAMES.length],
    contact_phone: `+7900123456${index % 10}`,
    price_with_vat: priceWithVat,
    price_no_vat: priceNoVat,
    organization_id: 14 + index,
    organization_inn: '9616244307',
    organization_name: BET_ORGANIZATIONS[index % BET_ORGANIZATIONS.length],
    transporter_comment: index % 3 === 0 ? 'Готовы выехать сегодня' : null,
    is_rejected: false,
    is_counter: index % 5 === 0,
    place: index + 1,
    is_win: isWinner,
    run_number: 0,
    cancel_reason: '',
    price_info: {
      price_with_vat: priceWithVat,
      price_no_vat: priceNoVat,
      payment_type: 'Безналичная с НДС',
      vat_rate: '20',
    },
  }
}

function createInitialBets(auctionId: number, basePrice: number, count: number): BetItem[] {
  const bets: BetItem[] = []
  for (let i = 0; i < count; i++) {
    const price = basePrice + (count - i) * 500
    bets.push(createBet(auctionId, i, price, i === 0 && count > 0))
  }
  return bets.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
}

const listItems = Array.from({ length: 30 }, (_, i) => createListItem(i))

export const auctionStore = {
  listItems,
  details: new Map<string, AuctionShowResponse>(
    listItems.map((item, i) => [item.main!.order_uid!, createDetail(item, i)]),
  ),
  bets: new Map<string, BetItem[]>(
    listItems.map((item, i) => {
      const orderUid = item.main!.order_uid!
      const basePrice = item.trading?.price?.current ?? 15000
      const betCount = i % 6
      return [orderUid, createInitialBets(item.main!.id!, basePrice, betCount)]
    }),
  ),
  nextBetId: 100000,
}

export function syncListItemFromDetail(uuid: string): void {
  const detail = auctionStore.details.get(uuid)
  const listItem = auctionStore.listItems.find((item) => item.main?.order_uid === uuid)
  if (!detail || !listItem) return

  const current = detail.trading.price?.current
  if (current != null && listItem.trading?.price) {
    listItem.trading.price.current = current
    listItem.trading.price.current_no_vat = detail.trading.price?.current_no_vat ?? withoutVat(current)
  }
  if (detail.trading.your && listItem.trading) {
    listItem.trading.your = {
      bet: detail.trading.your.bet ?? true,
      last_bet: detail.trading.your.last_bet ?? null,
    }
    listItem.trading.status_mobile = 'Leading'
    listItem.trading.is_last_bet_with_vat = detail.trading.your.last_bet_with_vat != null
  }
}
