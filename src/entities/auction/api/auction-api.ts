import { client } from '@/shared/api/client'
import { NotFoundError } from '@/shared/api/errors'
import type { AuctionListRequest, AuctionListResponse, AuctionShowResponse } from '@/shared/api/types'

export async function fetchAuctionList(
  params: AuctionListRequest = {},
): Promise<AuctionListResponse> {
  const { data, error, response } = await client.POST('/auctions/list', {
    body: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
    },
  })

  if (error || !data) {
    throw new Error(`Failed to fetch auctions: ${response.status}`)
  }

  return data
}

export async function fetchAuction(uuid: string): Promise<AuctionShowResponse> {
  const { data, error, response } = await client.GET('/auctions/{auctionUuid}', {
    params: { path: { auctionUuid: uuid } },
  })

  if (response.status === 404) {
    throw new NotFoundError('Аукцион не найден')
  }

  if (error || !data) {
    throw new Error(`Failed to fetch auction: ${response.status}`)
  }

  return data
}
