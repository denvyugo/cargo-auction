import type { components } from './api.ts'

export type AuctionListItem = components['schemas']['AuctionListItem']
export type AuctionListMeta = components['schemas']['AuctionListMeta']
export type AuctionListRequest = components['schemas']['AuctionListRequest']
export type AuctionListResponse = components['schemas']['AuctionListResponseBase']
export type AuctionShowResponse = components['schemas']['AuctionShowResponse']
export type BetItem = components['schemas']['BetItem']
export type BetListResponse = components['schemas']['BetListResponse']
export type SetBetRequest = components['schemas']['SetBetRequest']
export type ValidationProblem = components['schemas']['ValidationProblem']

export type STATUSES = components['schemas']['AuctionListItemTrading']['status']

export type AuctionsListFilters = Partial<Omit<AuctionListRequest, 'page' | 'per_page'>>
