import { useState } from 'react'

const P = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  funding: 'M2 6h20v12H2z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  passport: 'M3 5h18v14H3z M8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M5 16c0-1.7 1.3-3 3-3s3 1.3 3 3 M14 9h5 M14 13h5',
  book: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z M5 17a3 3 0 0 1 3-3h11',
  market: 'M3 9l2-5h14l2 5 M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z M5 14v6h14v-6',
  treasury: 'M3 10l9-6 9 6z M5 10v8 M9 10v8 M15 10v8 M19 10v8 M3 20h18',
  list: 'M9 4h6v3H9z M7 5H5v16h14V5h-2 M9 12h6 M9 16h6',
  settings: 'M4 7h10 M18 7h2 M4 17h2 M10 17h10 M16 5v4 M8 15v4',
  check: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M8 12l3 3 5-6',
  circle: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  logout: 'M9 4H5v16h4 M16 8l4 4-4 4 M20 12H9',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  back: 'M19 12H5 M11 6l-6 6 6 6',
}

export function Icon({ name, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[name]} />
    </svg>
  )
}

export function Logo({ size = 40 }) {
  const [bad, setBad] = useState(false)
  if (bad) return <span className="fx-logo-fb" style={{ width: size, height: size }}>F</span>
  return (
    <img src="/icon.png" alt="Fuel Business DAO" width={size} height={size}
      style={{ borderRadius: 10 }} onError={() => setBad(true)} />
  )
}

export function Tag({ tone = '', children }) {
  return <span className={'fx-tag ' + tone}>{children}</span>
}

export function ComingSoon({ title }) {
  return (
    <div className="card fx-soon">
      <h2>{title}</h2>
      <p className="note">This screen is built in a later step.</p>
    </div>
  )
}