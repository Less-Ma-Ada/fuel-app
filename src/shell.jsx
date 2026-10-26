import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { Icon, Logo, ComingSoon } from './ui'
import Dashboard from './Dashboard'
import Entrepreneur from './Entrepreneur'
import Funding from './Funding'
import './shell.css'


const NAV = [
  ['dashboard', 'Dashboard', 'home'],
  ['funding', 'Funding', 'funding'],
  ['passport', 'Passport', 'passport'],
  ['books', 'Bookkeeping', 'book'],
  ['market', 'Market', 'market'],
  ['treasury', 'Treasury', 'treasury'],
  ['apps', 'Applications', 'list'],
  ['settings', 'Settings', 'settings'],
]

export default function Shell({ profile }) {
  const [stack, setStack] = useState(['dashboard'])
  const page = stack[stack.length - 1]
  const canBack = stack.length > 1
  const title = NAV.find((n) => n[0] === page)[1]

  useEffect(() => {
    const onPop = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const go = (p) => {
    if (p === page) return
    window.history.pushState(null, '')
    setStack((s) => [...s, p].slice(-20))
    window.scrollTo(0, 0)
  }

  const back = () => {
    if (canBack) {
      window.history.back()
      window.scrollTo(0, 0)
    }
  }

  return (
    <div className="fx">
      <aside className="fx-side">
        <div className="fx-brand">
          <Logo size={40} />
          <div><b>Fuel</b><br /><span>Business DAO</span></div>
        </div>
        <nav className="fx-nav" aria-label="Main">
          {NAV.map(([k, label, icon]) => (
            <button key={k} className={page === k ? 'on' : ''} aria-current={page === k ? 'page' : undefined} onClick={() => go(k)}>
              <Icon name={icon} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="fx-user">
          <small>{profile.full_name}</small>
          <button onClick={() => supabase.auth.signOut()}><Icon name="logout" size={16} /> Log out</button>
        </div>
      </aside>

      <main className="fx-main">
        <div className="fx-top">
          {canBack && (
            <button className="fx-back" aria-label="Go back" onClick={back}>
              <Icon name="back" size={20} />
            </button>
          )}
          <span className="m-only"><Logo size={30} /></span>
          <b>{title}</b>
          <span className="m-only">
            <button aria-label="Log out" onClick={() => supabase.auth.signOut()}><Icon name="logout" size={18} /></button>
          </span>
        </div>

        {page === 'dashboard' && <Dashboard name={profile.full_name} go={go} />}
        {page === 'books' && <Entrepreneur />}
        {page === 'funding' && <Funding go={go} />}
        {!['dashboard', 'books', 'funding'].includes(page) && (
  <ComingSoon title={title} />
)}
      </main>
    </div>
  )
}