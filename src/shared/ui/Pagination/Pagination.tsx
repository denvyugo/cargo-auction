import './Pagination.css'

type PaginationProps = {
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, lastPage, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null

  const pages = getPageNumbers(currentPage, lastPage)

  return (
    <nav className="pagination" aria-label="Пагинация">
      <button
        type="button"
        className="pagination__btn"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← Назад
      </button>
      <ul className="pagination__list">
        {pages.map((page, index) =>
          page === '…' ? (
            <li key={`ellipsis-${index}`} className="pagination__ellipsis">
              …
            </li>
          ) : (
            <li key={page}>
              <button
                type="button"
                className={`pagination__page ${page === currentPage ? 'pagination__page--active' : ''}`}
                onClick={() => onPageChange(page)}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            </li>
          ),
        )}
      </ul>
      <button
        type="button"
        className="pagination__btn"
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Вперёд →
      </button>
    </nav>
  )
}

function getPageNumbers(current: number, last: number): (number | '…')[] {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1)
  }

  const pages: (number | '…')[] = [1]

  if (current > 3) pages.push('…')

  const start = Math.max(2, current - 1)
  const end = Math.min(last - 1, current + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (current < last - 2) pages.push('…')

  pages.push(last)
  return pages
}
