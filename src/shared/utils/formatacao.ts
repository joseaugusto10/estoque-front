export function formatarMoeda(value?: number | string | null) {
  if (value == null || value === '') return '—'
  const numero = typeof value === 'string' ? Number(value.replace(',', '.')) : value
  if (!Number.isFinite(numero)) return String(value)
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatarData(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('pt-BR')
}
