import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { TIER_INFO, waLink } from './util'
import { ScoreBar, FundingTracker } from './Bits'

const TYPES = ['Grant', 'Loan', 'Donation', 'Equipment or stock', 'Stokvel group funding', 'Sponsorship', 'Investment', 'Mentorship plus funding']

export default function Funder() {
  const [rows, setRows] = useState([])
  const [tier, setTier] = useState('LOW')
  const [q, setQ] = useState('')
  const [minScore, setMinScore] = useState(0)
  const [open, setOpen] = useState(null)
  const [pl, setPl] = useState({ amount: '', type: TYPES[0] })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    supabase.rpc('funder_listing').then(({ data, error }) => {
      if (error) setErr(error.message)
      else setRows(data || [])
    })
  }, [])

  const count = (t) => rows.filter((r) => r.tier === t).length
  const needle = q.trim().toLowerCase()
  const shown = rows
    .filter((r) => r.tier === tier && r.score >= minScore)
    .filter((r) => !needle || [r.name, r.area, r.sector].some((x) => (x || '').toLowerCase().includes(needle)))
    .sort((a, b) => b.score - a.score)

  async function pledge(e) {
    e.preventDefault()
    setMsg('')
    const amount = Number(pl.amount)
    if (!(amount > 0)) return setMsg('Enter an amount above zero.')
    const { error } = await supabase.rpc('create_pledge', { p_business: open, p_amount: amount, p_type: pl.type })
    if (error) return setMsg(error.message)
    setOpen(null)
    setPl({ amount: '', type: TYPES[0] })
    setMsg('Pledge recorded.')
    setTick(tick + 1)
  }

  return (
    <section>
      <h2>Businesses by tier</h2>
      <p className="note">Tiers keep competition fair. A small hustle never competes with a caterer. Scores are self-reported and not yet verified.</p>
      <div className="chips">
        {['LOW', 'MID', 'HIGH'].map((t) => (
          <button key={t} className={tier === t ? 'on' : ''} onClick={() => setTier(t)}>
            {t} ({count(t)})
          </button>
        ))}
      </div>
      <p className="note">{tier}: {TIER_INFO[tier]}, 7-day average.</p>
      <div className="row2">
        <input style={{ flex: 1 }} placeholder="Search name, area or sector" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={minScore} onChange={(e) => setMinScore(Number(e.target.value))}>
          <option value={0}>Any score</option>
          <option value={50}>50%+</option>
          <option value={60}>60%+</option>
          <option value={70}>70%+</option>
        </select>
      </div>

      {err && <p className="err">{err}</p>}
      {msg && <p className={msg === 'Pledge recorded.' ? 'note' : 'err'}>{msg}</p>}
      {shown.length === 0 && <p className="note">No businesses in this tier yet.</p>}

      {shown.map((r) => (
        <div className="card" key={r.id}>
          <div className="row2">
            <div>
              <b>{r.name}</b>
              <br />
              <small>{r.sector || 'Sector not set'} · {r.area || 'Area not set'}</small>
            </div>
            <span className="tag">{r.score}%</span>
          </div>
          <ScoreBar score={r.score} />
          {r.description && <p>{r.description}</p>}
          <small>{r.days_logged} days logged · {r.registered ? 'Registered (declared)' : 'Not registered'}</small>
          <div className="row2" style={{ marginTop: 8 }}>
            {r.whatsapp && (
              <a className="go" href={waLink(r.whatsapp, 'Hi ' + r.name + ', I found you on Fuel Business DAO.')} target="_blank" rel="noreferrer">WhatsApp</a>
            )}
            <button onClick={() => setOpen(open === r.id ? null : r.id)}>Pledge funding</button>
          </div>
          {open === r.id && (
            <form onSubmit={pledge} style={{ marginTop: 8 }}>
              <input type="number" min="1" placeholder="Amount (R)" value={pl.amount} onChange={(e) => setPl({ ...pl, amount: e.target.value })} />
              <select value={pl.type} onChange={(e) => setPl({ ...pl, type: e.target.value })}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <p className="note">A pledge records your intent. Loans and investments may need legal terms. Send money outside this app, then mark it as sent.</p>
              <button className="primary" type="submit">Record pledge</button>
            </form>
          )}
        </div>
      ))}

      <FundingTracker role="funder" refreshKey={tick} />
    </section>
  )
}