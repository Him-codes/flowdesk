import s from './Avatar.module.css'

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('')

interface AvatarProps {
  name: string
  size?: number
  src?: string
  /** Use when the person's name is already written next to the avatar, so screen readers don't hear it twice. */
  decorative?: boolean
}

export function Avatar({ name, size = 36, src, decorative = false }: AvatarProps) {
  if (src) return <img src={src} alt={decorative ? '' : name} className={s.avatar} style={{ width: size, height: size }} />
  return (
    <span className={s.avatar} style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">
      {initials(name) || '?'}
    </span>
  )
}
