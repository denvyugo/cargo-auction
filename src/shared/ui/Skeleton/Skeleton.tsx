import './Skeleton.css'

type SkeletonProps = {
  width?: string
  height?: string
  className?: string
}

export function Skeleton({ width = '100%', height = '1rem', className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton height="1.25rem" width="60%" />
      <Skeleton height="1rem" width="40%" />
      <Skeleton height="1rem" width="80%" />
      <div className="skeleton-card__footer">
        <Skeleton height="1.5rem" width="30%" />
        <Skeleton height="1.5rem" width="20%" />
      </div>
    </div>
  )
}
