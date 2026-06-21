import * as Lucide from 'lucide-react'
import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface IconProps {
  name: string
  size?: number
  color?: string
  style?: CSSProperties
  strokeWidth?: number
}

const registry = Lucide as unknown as Record<string, LucideIcon>

function pascal(name: string): string {
  return name
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

/**
 * Icon — renders a Lucide glyph by its kebab-case name (matching the design
 * source). Falls back to an empty fixed-size box for unknown names.
 */
export function Icon({ name, size = 18, color, style, strokeWidth = 1.75 }: IconProps) {
  const Cmp = registry[pascal(name)]
  if (!Cmp) {
    return <span style={{ display: 'inline-flex', width: size, height: size, flex: 'none', ...style }} />
  }
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} style={{ flex: 'none', ...style }} />
}
