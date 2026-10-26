import { useMemo, useState, type FormEvent } from 'react'
import { Button, Input, Modal, Select, type SelectOption } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import { api, ValidationError } from '../../data/api'
import { customers } from '../../data/customers'
import { useDataRevision } from '../../hooks/useDataRevision'
import type { NewTransactionInput, PaymentMethod, TransactionStatus } from '../../types'
import s from './AddTransactionModal.module.css'

const FORM_ID = 'add-transaction-form'
const METHOD_OPTIONS: SelectOption[] = [
  { value: 'Card', label: 'Card' },
  { value: 'Bank transfer', label: 'Bank transfer' },
  { value: 'PayPal', label: 'PayPal' },
  { value: 'Wallet', label: 'Wallet' },
]
const STATUS_OPTIONS: SelectOption[] = [
  { value: 'Completed', label: 'Completed' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Failed', label: 'Failed' },
]

interface AddTransactionModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

function AddTransactionDialog({ onClose, onCreated }: Omit<AddTransactionModalProps, 'open'>) {
  // Subscribe to customer data changes so customers created in another tab appear without reopening the app.
  const dataRevision = useDataRevision()
  const sortedCustomers = useMemo(
    () => [...customers].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) ||
      a.company.localeCompare(b.company, undefined, { sensitivity: 'base' }) ||
      a.id.localeCompare(b.id),
    ),
    [dataRevision],
  )
  const customerOptions: SelectOption[] = sortedCustomers.map((customer) => ({
    value: customer.id,
    label: customer.company.trim() ? `${customer.name} — ${customer.company}` : customer.name,
  }))
  const toast = useToast()
  const [values, setValues] = useState<NewTransactionInput>({
    customerId: sortedCustomers[0]?.id ?? '',
    amount: 0,
    method: 'Card',
    status: 'Completed',
  })
  const [amountText, setAmountText] = useState('')
  const [errors, setErrors] = useState<{ customerId?: string; amount?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    const amount = Number(amountText)
    const nextErrors: typeof errors = {}
    if (!values.customerId) nextErrors.customerId = 'Choose a customer.'
    if (!amountText.trim() || !Number.isFinite(amount) || amount <= 0) nextErrors.amount = 'Enter an amount greater than zero.'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      document.getElementById(nextErrors.customerId ? 'add-transaction-customer' : 'add-transaction-amount')?.focus()
      return
    }

    setSubmitting(true)
    try {
      await api.createTransaction({ ...values, amount })
      toast.success('Demo transaction added successfully.')
      onCreated()
      onClose()
    } catch (error) {
      if (error instanceof ValidationError && error.field === 'amount') setErrors({ amount: error.message })
      else toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Add transaction"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" form={FORM_ID} loading={submitting}>Add transaction</Button>
        </>
      }
    >
      <form id={FORM_ID} className={s.form} noValidate onSubmit={onSubmit}>
        <Select
          id="add-transaction-customer"
          label="Customer"
          options={customerOptions}
          value={values.customerId}
          error={errors.customerId}
          onChange={(e) => {
            setValues((current) => ({ ...current, customerId: e.target.value }))
            setErrors((current) => ({ ...current, customerId: undefined }))
          }}
        />
        <Input
          id="add-transaction-amount"
          label="Amount (USD)"
          type="number"
          min="0.01"
          max="1000000000"
          step="0.01"
          required
          placeholder="e.g. 125.00"
          value={amountText}
          error={errors.amount}
          onChange={(e) => {
            setAmountText(e.target.value)
            setErrors((current) => ({ ...current, amount: undefined }))
          }}
        />
        <Select label="Payment method" options={METHOD_OPTIONS} value={values.method} onChange={(e) => setValues((current) => ({ ...current, method: e.target.value as PaymentMethod }))} />
        <Select label="Status" options={STATUS_OPTIONS} value={values.status} onChange={(e) => setValues((current) => ({ ...current, status: e.target.value as TransactionStatus }))} />
        <p className={s.note}>Customers are listed alphabetically. Newly added customers appear here automatically. Demo only: no real payment is processed.</p>
      </form>
    </Modal>
  )
}

export function AddTransactionModal({ open, ...rest }: AddTransactionModalProps) {
  return open ? <AddTransactionDialog {...rest} /> : null
}
