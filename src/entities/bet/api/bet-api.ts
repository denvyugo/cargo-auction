import { client } from '@/shared/api/client'
import type { BetListResponse, SetBetRequest } from '@/shared/api/types'

export async function fetchBets(auctionUuid: string): Promise<BetListResponse> {
  const { data, error, response } = await client.GET('/auctions/{auctionUuid}/bets', {
    params: { path: { auctionUuid } },
  })

  if (response.status === 404) {
    throw new Error('Аукцион не найден')
  }

  if (error || !data) {
    throw new Error(`Failed to fetch bets: ${response.status}`)
  }

  return data
}

export async function setBet(auctionUuid: string, body: SetBetRequest): Promise<void> {
  const { error, response } = await client.POST('/auctions/{auctionUuid}/bets', {
    params: { path: { auctionUuid } },
    body,
  })

  if (response.status === 422) {
    throw new ValidationError('Проверьте введённую цену')
  }

  if (error || !response.ok) {
    throw new Error(`Failed to set bet: ${response.status}`)
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}
