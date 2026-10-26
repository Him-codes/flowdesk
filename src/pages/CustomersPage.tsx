import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { PageHeader } from '../components/layout'
import { Button } from '../components/ui'
import { api } from '../data/api'
import { AddCustomerModal } from '../features/customers/AddCustomerModal'
import { CustomerDetailsModal } from '../features/customers/CustomerDetailsModal'
import { CustomerList } from '../features/customers/CustomerList'
import { useAsync } from '../hooks/useAsync'

export default function CustomersPage() {
  const { data, error, loading, reload } = useAsync((signal) => api.getCustomers({ signal }), [])
  const [addOpen, setAddOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Deep link (`/customers?customer=CUS-1001`): open that customer's details, then drop the parameter so a refresh
  // or the back button doesn't reopen it.
  const [params, setParams] = useSearchParams()
  const linkedCustomer = params.get('customer')
  useEffect(() => {
    if (!linkedCustomer) return
    setSelectedId(linkedCustomer)
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.delete('customer')
        return next
      },
      { replace: true },
    )
  }, [linkedCustomer, setParams])

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Manage and understand your customer relationships."
        actions={
          <Button icon={<UserPlus size={16} />} onClick={() => setAddOpen(true)}>
            Add customer
          </Button>
        }
      />
      <CustomerList customers={data} loading={loading} error={error} onRetry={reload} onSelect={setSelectedId} onAdd={() => setAddOpen(true)} />
      <AddCustomerModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={reload} />
      <CustomerDetailsModal customerId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  )
}
