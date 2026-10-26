import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import Auth from './Auth'
import Shell from './Shell'
import Funder from './Funder'
import Customer from './Customer'
import './App.css'

export default function App() {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setProfile(null)
      return
    }
    supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
      .then(({ data }) => {
        if (data) setProfile(data)
        else supabase.auth.signOut({ scope: 'local' })
      })
  }, [session])

  if (session === undefined) return <p className="app">Loading…</p>
  if (!session) return <Auth />
  if (!profile) return <p className="app">Loading…</p>

  if (profile.role === 'entrepreneur') return <Shell profile={profile} />

  return (
    <div className="app">
      <header>
        <img src="/icon.png" alt="" onError={(e) => (e.target.style.display = 'none')} />
        <div>
          <h1>Fuel Business DAO</h1>
          <p>{profile.full_name} · {profile.role}</p>
        </div>
        <button onClick={() => supabase.auth.signOut()}>Log out</button>
      </header>
      {profile.role === 'funder' && <Funder />}
      {profile.role === 'customer' && <Customer />}
    </div>
  )
}