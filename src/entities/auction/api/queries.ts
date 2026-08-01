export const auctionKeys = {
  all: ['auctions'] as const,
  lists: () => [...auctionKeys.all, 'list'] as const,
  list: (params: { page: number; perPage: number }) =>
    [...auctionKeys.lists(), params] as const,
  details: () => [...auctionKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...auctionKeys.details(), uuid] as const,
}
