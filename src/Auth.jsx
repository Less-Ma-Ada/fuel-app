import { useState } from 'react'
import { supabase } from './supabase'

const ROLES = [
  ['entrepreneur', 'I run a business'],
  ['funder', 'I fund businesses'],
  ['customer', 'I am a customer'],
]

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('entrepreneur')
  const [f, setF] = useState({ name: '', email: '', password: '', business: '', registered: 'no', org: '' })
  const [agree, setAgree] = useState(false)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setMsg('')
    if (f.password.length < 8) return setMsg('Use a password with at least 8 characters.')
    if (mode === 'signup' && !agree) return setMsg('Please accept the privacy notice.')

    let meta = { role, full_name: f.name.trim() }
    if (role === 'entrepreneur') {
      meta = { ...meta, business_name: f.business.trim(), registered: f.registered }
    }
    if (role === 'funder') {
      meta = { role, full_name: f.org.trim(), org_name: f.org.trim() }
    }

    setBusy(true)
    const { data, error } =
      mode === 'signup'
        ? await supabase.auth.signUp({ email: f.email.trim(), password: f.password, options: { data: meta } })
        : await supabase.auth.signInWithPassword({ email: f.email.trim(), password: f.password })
    setBusy(false)
    if (error) return setMsg(error.message)
    if (mode === 'signup' && !data.session) setMsg('Check your email to confirm your account, then log in.')
  }

  return (
    <div className="app">
      <header>
        <img src="/icon.png" alt="" onError={(e) => (e.target.style.display = 'none')} />
        <div>
          <h1>Fuel Business DAO</h1>
          <p>Fuel your business. Unlock your potential.</p>
        </div>
      </header>

      <nav>
        <button className={mode === 'login' ? 'on' : ''} onClick={() => setMode('login')}>Log in</button>
        <button className={mode === 'signup' ? 'on' : ''} onClick={() => setMode('signup')}>Sign up</button>
      </nav>

      <form onSubmit={submit}>
        {mode === 'signup' && (
          <div className="chips">
            {ROLES.map(([k, label]) => (
              <button type="button" key={k} className={role === k ? 'on' : ''} onClick={() => setRole(k)}>{label}</button>
            ))}
          </div>
        )}

        {mode === 'signup' && role === 'entrepreneur' && (
          <>
            <input required placeholder="Full name" value={f.name} onChange={set('name')} />
            <input required placeholder="Business name" value={f.business} onChange={set('business')} />
            <select value={f.registered} onChange={set('registered')}>
              <option value="no">Not registered</option>
              <option value="yes">Registered</option>
            </select>
            <input required type="email" placeholder="Email" value={f.email} onChange={set('email')} />
          </>
        )}

        {mode === 'signup' && role === 'funder' && (
          <>
            <input required placeholder="Organisation name" value={f.org} onChange={set('org')} />
            <input required type="email" placeholder="Work email" value={f.email} onChange={set('email')} />
          </>
        )}

        {mode === 'signup' && role === 'customer' && (
          <>
            <input required placeholder="Full name" value={f.name} onChange={set('name')} />
            <input required type="email" placeholder="Email" value={f.email} onChange={set('email')} />
          </>
        )}

        {mode === 'login' && (
          <input required type="email" placeholder="Email" value={f.email} onChange={set('email')} />
        )}

        <input required type="password" placeholder="Password (8+ characters)" value={f.password} onChange={set('password')} />

        {mode === 'signup' && (
          <div className="box">
            <b>Privacy notice (POPIA)</b>
            <p>We collect only what we need to run your account. You choose what funders and customers can see. You can ask us to correct or delete your data.</p>
            <label><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I understand and agree.</label>
          </div>
        )}

        {msg && <p className="err">{msg}</p>}
        <button type="submit" className="primary" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}
        </button>
      </form>
    </div>
  )
}