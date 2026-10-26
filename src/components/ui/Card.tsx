import type { ElementType, HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import s from './Card.module.css'

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article'
  padded?: boolean
}

export function Card({ as = 'div', padded = true, className, ...rest }: CardProps) {
  const Tag = as as ElementType
  return <Tag className={cx(s.card, padded && s.padded, className)} {...rest} />
}
