import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { R, scoreTone } from './util'

export function ScoreBar({ score }) {
  return (
    <div className="bar">
      <div className={'fill ' + scoreTone(score)} style={{ width: score + '%' }} />
    </div>
  )
}

const LABEL = { pledged: 'Pledged', sent: 'Sent', confirmed: 'Confirmed' }
const TONE = { pledged: 'warn', sent: 'warn', confirmed: 'good' }

export function FundingTracker({ role, refreshKey = 0 }) {
  const [rows, setRows] = useState([])
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('my_funding')
    if (error) setErr(error.message)
    else setRows(data || [])
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  async function move(id, status) {
    setErr('')
    const { error } = await supabase.rpc('set_funding_status', { p_event: id, p_status: status })
    if (error) setErr(error.message)
    load()
  }

  return (
    <div>
      <h2>Funding tracker</h2>
      <p className="note">Only confirmed amounts count as received. This app records funding. It does not move money.</p>
      {err && <p className="err">{err}</p>}
      {rows.length === 0 && <p className="note">No funding yet.</p>}
      {rows.map((r) => (
        <div className="card row2" key={r.id}>
          <div>
            <b>{role === 'funder' ? r.business_name : r.org_name}</b>
            <br />
            <small>{r.type} · {R(r.amount)}</small>
          </div>
          <span className={'tag ' + TONE[r.status]}>{LABEL[r.status]}</span>
          {role === 'funder' && r.status === 'pledged' && (
            <button onClick={() => move(r.id, 'sent')}>Mark as sent</button>
          )}
          {role === 'entrepreneur' && r.status === 'sent' && (
            <button className="go" onClick={() => move(r.id, 'confirmed')}>Confirm received</button>
          )}
        </div>
      ))}
    </div>
  )
}