export function downloadCsv(filename: string, rows: Record<string, string | number>[]) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const escape = (value: string | number) => {
    const text = String(value ?? '')
    return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  const csv = [headers.join(';'), ...rows.map((row) => headers.map((header) => escape(row[header])).join(';'))].join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const adminCategoryColors: Record<string, string> = {
  'Parcs & attractions': '#c4664b',
  'Culture & patrimoine': '#9d7a41',
  'Nature & aventure': '#547d65',
  'City breaks': '#5c7687',
  'Séjour thématiques': '#8a6a86',
  'Séjours thématiques': '#8a6a86',
}

export const monthKey = (date: string | Date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export const monthLabel = (date: Date) =>
  new Intl.DateTimeFormat('fr-BE', { month: 'short' }).format(date).replace('.', '')

export const getLastMonths = (count: number) => {
  const months: Date[] = []
  const now = new Date()
  now.setDate(1)
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setMonth(now.getMonth() - i)
    months.push(d)
  }
  return months
}
