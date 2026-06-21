import { useId } from 'react'
import type { CSSProperties, SVGAttributes } from 'react'

export interface SparklineProps extends Omit<SVGAttributes<SVGSVGElement>, 'width' | 'height' | 'color' | 'fill'> {
  data?: number[]
  width?: number
  height?: number
  color?: string
  fill?: boolean
  strokeWidth?: number
  style?: CSSProperties
}

export function Sparkline({
  data = [],
  width = 120,
  height = 36,
  color = 'var(--accent)',
  fill = true,
  strokeWidth = 2,
  style,
  ...rest
}: SparklineProps) {
  const rawId = useId()
  const gid = 'spk' + rawId.replace(/:/g, '')

  if (!data.length) return <svg width={width} height={height} style={style} {...rest} />

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1 || 1)
  const pts = data.map((d, i): [number, number] => [i * stepX, height - 3 - ((d - min) / range) * (height - 6)])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`
  const last = pts[pts.length - 1]

  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible', ...style }} {...rest}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={2.6} fill={color} />
    </svg>
  )
}
