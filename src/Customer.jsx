import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { waLink } from './util'
import { ScoreBar } from './Bits'

export default function Customer() {
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [sector, setSector] = useState('All')
  const [err, setErr] = useState('')

  useEffect(() => {
    supabase.rpc('customer_listing').then(({ data, error }) => {
      if (error) setErr(error.message)
      else setRows(data || [])
    })
  }, [])

  const sectors = ['All', ...new Set(rows.map((r) => r.sector).filter(Boolean))]
  const needle = q.trim().toLowerCase()
  const shown = rows
    .filter((r) => sector === 'All' || r.sector === sector)
    .filter((r) => !needle || [r.name, r.area, r.description].some((x) => (x || '').toLowerCase().includes(needle)))
    .sort((a, b) => b.score - a.score)

  return (
    <section>
      <h2>Find local businesses</h2>
      <input placeholder="Search by name, area or product" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="chips" style={{ marginTop: 8 }}>
        {sectors.map((s) => (
          <button key={s} className={sector === s ? 'on' : ''} onClick={() => setSector(s)}>{s}</button>
        ))}
      </div>
      {err && <p className="err">{err}</p>}
      {shown.length === 0 && <p className="note">No businesses to show yet.</p>}
      {shown.map((r) => (
        <div className="card" key={r.id}>
          <div className="row2">
            <div>
              <b>{r.name}</b>
              <br />
              <small>{r.sector || 'Business'} · {r.area}</small>
            </div>
            <span className="tag">{r.score}% consistency</span>
          </div>
          <ScoreBar score={r.score} />
          {r.description && <p>{r.description}</p>}
          {r.whatsapp && (
            <a className="go" href={waLink(r.whatsapp, 'Hi ' + r.name + ', I found you on Fuel Business DAO.')} target="_blank" rel="noreferrer">WhatsApp</a>
          )}
        </div>
      ))}
      <p className="note">Consistency shows how regularly a business keeps records. It is self-reported.</p>
    </section>
  )
}