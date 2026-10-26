/** Builds RFC 4180 CSV. Text cells starting with = + - @ are prefixed with ' to defuse spreadsheet formula injection. */
export function toCsv(rows: ReadonlyArray<ReadonlyArray<string | number>>): string {
  const cell = (value: string | number) => {
    let text = String(value)
    if (typeof value === 'string' && /^[=+\-@]/.test(text)) text = `'${text}`
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  return rows.map((row) => row.map(cell).join(',')).join('\r\n')
}

export function downloadCsv(filename: string, csv: string): void {
  const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
