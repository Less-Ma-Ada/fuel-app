export const R = (n) => 'R' + Math.round(Number(n) || 0).toLocaleString('en-ZA')

const TZ = 'Africa/Johannesburg'
export const todaySA = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ })
export const daysAgoSA = (n) =>
  new Date(Date.now() - n * 86400000).toLocaleDateString('en-CA', { timeZone: TZ })

export const scoreTone = (s) => (s < 40 ? 'low' : s < 70 ? 'mid' : 'high')

export const TIER_INFO = {
  LOW: 'R0-R500 a day',
  MID: 'R501-R1,000 a day',
  HIGH: 'R1,001+ a day',
}

export function normalizeWa(v) {
  let d = String(v || '').replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('0')) d = '27' + d.slice(1)
  return /^27\d{9}$/.test(d) ? d : null
}

export const waLink = (num, text) =>
  'https://wa.me/' + num + '?text=' + encodeURIComponent(text)