export const betKeys = {
  all: ['bets'] as const,
  list: (auctionUuid: string) => [...betKeys.all, auctionUuid] as const,
}
