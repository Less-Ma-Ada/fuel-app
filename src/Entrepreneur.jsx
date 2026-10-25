import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { R, todaySA, daysAgoSA, normalizeWa, TIER_INFO } from './util'
import { ScoreBar, FundingTracker } from './Bits'

const SECTORS = ['Retail', 'Food and catering', 'Agriculture', 'Manufacturing', 'Services', 'Construction', 'Technology', 'Other']
const EMPTY = { revenue: '', expenses: '', note: '', off: false }

export default function Entrepreneur() {
  const [biz, setBiz] = useState(undefined)
  const [sum, setSum] = useState(null)
  const [recs, setRecs] = useState([])
  const [prof, setProf] = useState(null)
  const [day, setDay] = useState(todaySA())
  const [log, setLog] = useState(EMPTY)
  const [msg, setMsg] = useState('')
  const [pmsg, setPmsg] = useState('')
  const today = todaySA()

  const load = useCallback(async () => {
    const { data: b } = await supabase.from('businesses').select('*').maybeSingle()
    setBiz(b || null)
    if (!b) return
    setProf((p) => p || {
      sector: b.sector || '',
      area: b.area || '',
      description: b.description || '',
      whatsapp: b.whatsapp || '',
      show_to_customers: b.show_to_customers,
      show_to_funders: b.show_to_funders,
    })
    const { data: s } = await supabase.rpc('my_summary')
    setSum(s && s[0] ? s[0] : null)
    const { data: r } = await supabase
      .from('cashflow_records')
      .select('*')
      .eq('business_id', b.id)
      .order('day', { ascending: false })
      .limit(60)
    setRecs(r || [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const r = recs.find((x) => x.day === day)
    setLog(r ? { revenue: String(r.revenue), expenses: String(r.expenses), note: r.note || '', off: r.is_day_off } : EMPTY)
  }, [day, recs])

  async function saveLog(e) {
    e.preventDefault()
    setMsg('')
    const revenue = log.off ? 0 : Number(log.revenue || 0)
    const expenses = log.off ? 0 : Number(log.expenses || 0)
    if (revenue < 0 || expenses < 0) return setMsg('Amounts cannot be negative.')
    if (!log.off && revenue === 0 && !window.confirm('R0 counts as a missed day. Tick Day Off if you were closed. Save anyway?')) return
    const { error } = await supabase.from('cashflow_records').upsert(
      { business_id: biz.id, day, revenue, expenses, note: log.note.trim().slice(0, 200), is_day_off: log.off },
      { onConflict: 'business_id,day' }
    )
    if (error) return setMsg(error.message)
    setMsg('Saved.')
    load()
  }

  async function saveProfile(e) {
    e.preventDefault()
    setPmsg('')
    const wa = normalizeWa(prof.whatsapp)
    if (wa === null) return setPmsg('Enter a valid South African number, like 0712345678.')
    if ((prof.show_to_customers || prof.show_to_funders) && !prof.area.trim()) return setPmsg('Add your area before you switch on visibility.')
    if (prof.show_to_customers && !wa) return setPmsg('Add a WhatsApp number so customers can reach you.')
    const { error } = await supabase
      .from('businesses')
      .update({
        sector: prof.sector || null,
        area: prof.area.trim() || null,
        description: prof.description.trim().slice(0, 300) || null,
        whatsapp: wa || null,
        show_to_customers: prof.show_to_customers,
        show_to_funders: prof.show_to_funders,
      })
      .eq('id', biz.id)
    if (error) return setPmsg(error.message)
    setPmsg('Profile saved.')
    load()
  }

  if (biz === undefined) return <p className="note">Loading…</p>
  if (biz === null) return <p className="err">No business found for this account. Delete it and sign up again.</p>
  if (!sum || !prof) return <p className="note">Loading…</p>

  const from = daysAgoSA(29)
  const last30 = recs.filter((r) => r.day >= from)
  const income = last30.reduce((s, r) => s + Number(r.revenue), 0)
  const spend = last30.reduce((s, r) => s + Number(r.expenses), 0)
  const setP = (k) => (e) => setProf({ ...prof, [k]: e.target.value })

  return (
    <section>
      <div className="row2">
        <div>
          <h2 style={{ margin: 0 }}>{biz.name}</h2>
          <small>{biz.area || 'Add your area below'} · {biz.registered ? 'Registered (declared)' : 'Not registered'}</small>
        </div>
        <span className="tag">{sum.tier} · {TIER_INFO[sum.tier]}</span>
      </div>

      <div className="stats">
        <div className="stat"><small>Consistency score</small><b>{sum.score}%</b></div>
        <div className="stat"><small>Days logged</small><b>{sum.days_logged}</b></div>
        <div className="stat"><small>Day Offs this month</small><b>{sum.days_off_this_month}/4</b></div>
      </div>
      <div className="card">
        <ScoreBar score={sum.score} />
        <p className="note">Built from your own daily records. Not yet verified. Log every day to grow it.</p>
      </div>

      <div className="stats">
        <div className="stat"><small>Income, 30 days</small><b>{R(income)}</b></div>
        <div className="stat"><small>Expenses, 30 days</small><b>{R(spend)}</b></div>
        <div className="stat"><small>Cash flow</small><b>{R(income - spend)}</b></div>
      </div>

      <h2>Log your day</h2>
      <form className="card" onSubmit={saveLog}>
        <input type="date" value={day} min={biz.start_date} max={today} onChange={(e) => setDay(e.target.value || today)} />
        {day < today && <p className="note">Late or edited entries lose 5%.</p>}
        <label>
          <input type="checkbox" checked={log.off} onChange={(e) => setLog({ ...log, off: e.target.checked })} /> Day Off (closed)
        </label>
        {log.off && sum.days_off_this_month >= 4 && (
          <p className="note">You used all 4 Day Offs this month. This one counts as a missed day.</p>
        )}
        {!log.off && (
          <>
            <input type="number" min="0" placeholder="Money in today (R)" value={log.revenue} onChange={(e) => setLog({ ...log, revenue: e.target.value })} />
            <input type="number" min="0" placeholder="Money out today (R)" value={log.expenses} onChange={(e) => setLog({ ...log, expenses: e.target.value })} />
          </>
        )}
        <input maxLength={200} placeholder="Note (optional)" value={log.note} onChange={(e) => setLog({ ...log, note: e.target.value })} />
        {msg && <p className={msg === 'Saved.' ? 'note' : 'err'}>{msg}</p>}
        <button className="primary" type="submit">Save</button>
      </form>

      <h2>Recent days</h2>
      {recs.slice(0, 7).map((r) => (
        <div className="card row2" key={r.id}>
          <b>{r.day}</b>
          <span>{r.is_day_off ? 'Day Off' : R(r.revenue)}</span>
          {r.edited && <span className="tag warn">Edited</span>}
        </div>
      ))}
      {recs.length === 0 && <p className="note">No records yet. Log your first day above.</p>}

      <FundingTracker role="entrepreneur" />

      <h2>Profile and visibility</h2>
      <form className="card" onSubmit={saveProfile}>
        <select value={prof.sector} onChange={setP('sector')}>
          <option value="">Sector</option>
          {SECTORS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input placeholder="Area or township" value={prof.area} onChange={setP('area')} />
        <textarea maxLength={300} placeholder="What do you sell?" value={prof.description} onChange={setP('description')} />
        <input placeholder="WhatsApp number, like 0712345678" value={prof.whatsapp} onChange={setP('whatsapp')} />
        <label>
          <input type="checkbox" checked={prof.show_to_customers} onChange={(e) => setProf({ ...prof, show_to_customers: e.target.checked })} /> Show me to customers
        </label>
        <p className="note">Customers see your name, sector, area, description, WhatsApp number and score. Never your money.</p>
        <label>
          <input type="checkbox" checked={prof.show_to_funders} onChange={(e) => setProf({ ...prof, show_to_funders: e.target.checked })} /> Show me to funders
        </label>
        <p className="note">Funders see the same, plus your tier, days logged and registration status.</p>
        {pmsg && <p className={pmsg === 'Profile saved.' ? 'note' : 'err'}>{pmsg}</p>}
        <button className="primary" type="submit">Save profile</button>
      </form>
    </section>
  )
}