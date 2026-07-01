import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { api } from '../lib/api'
import './login.css'

interface Account {
  id: string
  name: string
  handle: string
  role: string
  initial: string
}

const ACCOUNTS: Account[] = [
  { id: 'linyue', name: '林越', handle: '@linyue', role: '综合运动训练', initial: '林' },
  { id: 'suning', name: '苏宁', handle: '@suning', role: '马拉松 · 公路跑', initial: '苏' },
  { id: 'chenyu', name: '陈宇', handle: '@chenyu', role: '越野跑 · 登山', initial: '陈' },
]

// Where to send the user after a successful sign-in (the main app).
const APP_URL = '/'

export function Login() {
  const [selected, setSelected] = useState<string | null>(null)
  const [showPw, setShowPw] = useState(false)
  const [pw, setPw] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const pwRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (selected) {
      const t = setTimeout(() => pwRef.current?.focus(), 220)
      return () => clearTimeout(t)
    }
  }, [selected])

  const doLogin = () => {
    if (!selected || loggingIn) return
    setLoggingIn(true)
    // Best-effort auth, then enter the app (redirect regardless of backend state).
    const go = () => {
      window.location.href = APP_URL
    }
    api
      .login(selected, pw)
      .then((res) => {
        try {
          localStorage.setItem('readyn.token', res.token)
        } catch {
          /* ignore storage errors */
        }
      })
      .catch(() => {})
      .finally(() => setTimeout(go, 400))
  }

  return (
    <div className="login-wrap">
      <aside className="brand">
        <div className="logo-row">
          <span className="logo-mark">
            <Icon name="hexagon" size={22} color="#fff" strokeWidth={2} />
          </span>
          <span className="wordmark">Readyn</span>
          <span className="brand-badge">个人版</span>
        </div>

        <div className="brand-hero">
          <h1>
            Performance,
            <br />
            quantified.
          </h1>
          <p>把多源运动与健康数据汇聚一处 —— 趋势、恢复、HRV 与 AI 教练，让每一次训练都有据可依。</p>
          <div className="brand-stats">
            <div className="s">
              <span className="v">8</span>
              <span className="k">数据源接入</span>
            </div>
            <div className="s">
              <span className="v">5</span>
              <span className="k">运动项目</span>
            </div>
            <div className="s">
              <span className="v">AI</span>
              <span className="k">综合分析</span>
            </div>
          </div>
        </div>

        <div className="brand-foot">© 2026 Readyn · Performance Analytics</div>
      </aside>

      <main className="auth">
        <div className="auth-card">
          <h2>登录 Readyn</h2>
          <p className="sub">选择账户以继续</p>

          <span className="label">账户</span>
          <div className="accounts">
            {ACCOUNTS.map((a) => (
              <button
                key={a.id}
                className={`acct${selected === a.id ? ' sel' : ''}`}
                onClick={() => setSelected(a.id)}
                type="button"
              >
                <span className="avatar">{a.initial}</span>
                <span className="meta">
                  <div className="nm">
                    {a.name} <span className="hd">{a.handle}</span>
                  </div>
                  <div className="rl">{a.role}</div>
                </span>
                <span className="tick">
                  <Icon name="check" size={12} color="#fff" strokeWidth={3} />
                </span>
              </button>
            ))}
          </div>

          <div className={`pw-block${selected ? ' open' : ''}`}>
            <span className="label">密码</span>
            <div className="pw-field">
              <input
                ref={pwRef}
                type={showPw ? 'text' : 'password'}
                placeholder="输入账户密码"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') doLogin()
                }}
              />
              <button className="pw-eye" type="button" aria-label="显示密码" onClick={() => setShowPw((v) => !v)}>
                <Icon name="eye" size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="row">
              <label className="remember">
                <input type="checkbox" defaultChecked /> 记住此设备
              </label>
              <a className="forgot" href="#">
                忘记密码？
              </a>
            </div>
            <button className="login-btn" type="button" disabled={!selected || loggingIn} onClick={doLogin}>
              {loggingIn ? '登录中…' : '登录'}
              {!loggingIn && <Icon name="arrow-right" size={18} color="#fff" strokeWidth={2} />}
            </button>
          </div>

          <p className="hint">
            没有账户？请联系你的教练或管理员开通 ·<br />
            <a href="#">了解 Readyn</a>
          </p>
        </div>
      </main>
    </div>
  )
}
