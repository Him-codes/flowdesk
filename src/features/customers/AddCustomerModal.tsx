import { useState, type FormEvent } from 'react'
import { Button, Input, Modal, Select, type SelectOption } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import { ValidationError, api } from '../../data/api'
import type { CustomerStatus, NewCustomerInput } from '../../types'
import { CUSTOMER_FIELD_ORDER, validateCustomer, type CustomerErrors, type CustomerField } from './validation'
import s from './AddCustomerModal.module.css'

const FORM_ID = 'add-customer-form'
const STATUS_OPTIONS: SelectOption[] = [
  { value: 'New', label: 'New' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
]
const EMPTY: NewCustomerInput = { name: '', email: '', company: '', phone: '', location: '', status: 'New' }

const focusField = (field: CustomerField) => document.getElementById(`add-customer-${field}`)?.focus()

interface AddCustomerModalProps {
  open: boolean
  onClose: () => void
  /** Called after the customer is saved, so the list can refresh. */
  onCreated: () => void
}

/** Form state lives in the dialog, so it resets every time the modal opens. */
function AddCustomerDialog({ onClose, onCreated }: Omit<AddCustomerModalProps, 'open'>) {
  const toast = useToast()
  const [values, setValues] = useState<NewCustomerInput>(EMPTY)
  const [errors, setErrors] = useState<CustomerErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const setField = <K extends keyof NewCustomerInput>(key: K, value: NewCustomerInput[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return

    const found = validateCustomer(values)
    const firstInvalid = CUSTOMER_FIELD_ORDER.find((field) => found[field])
    if (firstInvalid) {
      setErrors(found)
      focusField(firstInvalid)
      return
    }

    setSubmitting(true)
    try {
      await api.createCustomer(values)
      toast.success('Customer added successfully.')
      onCreated()
      onClose()
    } catch (error) {
      const field = error instanceof ValidationError ? (error.field as CustomerField) : undefined
      if (field && CUSTOMER_FIELD_ORDER.includes(field)) {
        setErrors({ [field]: (error as ValidationError).message })
        focusField(field)
      } else {
        toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
      }
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Add customer"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} loading={submitting}>
            Add customer
          </Button>
        </>
      }
    >
      <form id={FORM_ID} className={s.form} noValidate onSubmit={onSubmit}>
        <Input
          id="add-customer-name"
          label="Full name"
          required
          autoComplete="off"
          value={values.name}
          error={errors.name}
          onChange={(e) => setField('name', e.target.value)}
        />
        <Input
          id="add-customer-email"
          label="Email address"
          type="email"
          required
          autoComplete="off"
          value={values.email}
          error={errors.email}
          onChange={(e) => setField('email', e.target.value)}
        />
        <Input
          id="add-customer-company"
          label="Company"
          required
          autoComplete="off"
          value={values.company}
          error={errors.company}
          onChange={(e) => setField('company', e.target.value)}
        />
        <Input
          id="add-customer-phone"
          label="Phone (optional)"
          type="tel"
          autoComplete="off"
          hint="Include the country code, for example +234 801 234 5678."
          value={values.phone}
          error={errors.phone}
          onChange={(e) => setField('phone', e.target.value)}
        />
        <Input
          id="add-customer-location"
          label="Location (optional)"
          autoComplete="address-level2"
          hint="City, state, or country."
          value={values.location}
          onChange={(e) => setField('location', e.target.value)}
        />
        <Select label="Status" options={STATUS_OPTIONS} value={values.status} onChange={(e) => setField('status', e.target.value as CustomerStatus)} />
        <p className={s.note}>Demo only: customers you add are saved in this browser and remain after refreshing. Clearing this browser's site data removes them.</p>
      </form>
    </Modal>
  )
}

export function AddCustomerModal({ open, ...rest }: AddCustomerModalProps) {
  return open ? <AddCustomerDialog {...rest} /> : null
}
