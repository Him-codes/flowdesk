import { cx } from '../../utils/cx'
import s from './Skeleton.module.css'

interface SkeletonProps {
  width?: number | string
  height?: number | string
  radius?: number | string
  className?: string
}

/** Decorative placeholder. Put `aria-busy` on the region that is loading. */
export function Skeleton({ width = '100%', height = 16, radius = 8, className }: SkeletonProps) {
  return <span className={cx(s.skeleton, className)} style={{ width, height, borderRadius: radius }} aria-hidden="true" />
}
