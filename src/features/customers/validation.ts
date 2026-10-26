import type { NewCustomerInput } from '../../types'
import { isValidEmail } from '../../utils/validation'

export type CustomerField = 'name' | 'email' | 'company' | 'phone'
export type CustomerErrors = Partial<Record<CustomerField, string>>

/** Order in which fields appear in the form; the first invalid one receives focus. */
export const CUSTOMER_FIELD_ORDER: CustomerField[] = ['name', 'email', 'company', 'phone']

const PHONE = /^\+?[\d\s().-]{7,20}$/

export function validateCustomer(values: NewCustomerInput): CustomerErrors {
  const errors: CustomerErrors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const phone = values.phone.trim()

  if (!name) errors.name = 'Enter the customer’s full name.'
  else if (name.length < 2) errors.name = 'Name must be at least 2 characters.'

  if (!email) errors.email = 'Enter an email address.'
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address, like name@company.com.'

  if (!values.company.trim()) errors.company = 'Enter the customer’s company.'

  if (phone && !PHONE.test(phone)) errors.phone = 'Enter a valid phone number, or leave this blank.'

  return errors
}
