import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../components/ui'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/layout'
import { api } from '../data/api'
import { AddTransactionModal } from '../features/transactions/AddTransactionModal'
import { TransactionDetailsModal } from '../features/transactions/TransactionDetailsModal'
import { TransactionList, type SearchSeed } from '../features/transactions/TransactionList'
import { useAsync } from '../hooks/useAsync'

export default function TransactionsPage() {
  const { data, error, loading, reload } = useAsync((signal) => api.getTransactions({ signal }), [])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  // Deep link (`/transactions?q=Amina%20Okafor`): pre-fill the search, then drop the parameter so a refresh
  // doesn't reapply it. A new object per link means following the same link twice still applies it twice.
  const [params, setParams] = useSearchParams()
  const [seed, setSeed] = useState<SearchSeed | null>(null)
  const linkedQuery = params.get('q')
  useEffect(() => {
    if (linkedQuery === null) return
    setSeed({ query: linkedQuery })
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.delete('q')
        return next
      },
      { replace: true },
    )
  }, [linkedQuery, setParams])

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle="Track every payment across your business."
        actions={<Button icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>Add transaction</Button>}
      />
      <TransactionList transactions={data} loading={loading} error={error} onRetry={reload} onSelect={setSelectedId} searchSeed={seed} />
      <AddTransactionModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={reload} />
      <TransactionDetailsModal transactionId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  )
}
