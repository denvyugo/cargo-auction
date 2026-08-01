import { AuctionList } from '@/widgets/auction-list/AuctionList'

export function AuctionsListPage() {
  return (
    <div className="app-layout">
      <header className="app-layout__header">
        <h1 className="app-layout__title">Аукционы</h1>
        <p className="app-layout__subtitle">Список активных грузоперевозочных аукционов</p>
      </header>
      <main className="app-layout__main">
        <AuctionList />
      </main>
    </div>
  )
}
