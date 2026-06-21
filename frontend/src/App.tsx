import { Button, Card } from './design-system'

export default function App() {
  return (
    <div style={{ padding: 'var(--sp-8)' }}>
      <Card title="Readyn">
        <p style={{ color: 'var(--text-muted)', margin: '0 0 var(--sp-4)' }}>运动数据分析平台 — 脚手架就绪</p>
        <Button>开始</Button>
      </Card>
    </div>
  )
}
