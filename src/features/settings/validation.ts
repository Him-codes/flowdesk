import type { Profile } from '../../types'
import { isValidEmail } from '../../utils/validation'

export type ProfileField = 'name' | 'email' | 'company'
export type ProfileErrors = Partial<Record<ProfileField, string>>
export const PROFILE_FIELD_ORDER: ProfileField[] = ['name', 'email', 'company']

export function validateProfile(profile: Profile): ProfileErrors {
  const errors: ProfileErrors = {}
  const name = profile.name.trim()
  if (!name) errors.name = 'Enter your name.'
  else if (name.length > 60) errors.name = 'Name must be 60 characters or fewer.'

  const email = profile.email.trim()
  if (!email) errors.email = 'Enter your email address.'
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address, like name@company.com.'

  if (profile.company.trim().length > 80) errors.company = 'Company must be 80 characters or fewer.'
  return errors
}

export interface PasswordForm {
  current: string
  next: string
  confirm: string
}
export type PasswordField = keyof PasswordForm
export type PasswordErrors = Partial<Record<PasswordField, string>>
export const PASSWORD_FIELD_ORDER: PasswordField[] = ['current', 'next', 'confirm']
export const MIN_PASSWORD_LENGTH = 8

/** Format checks only. Nothing is sent, stored or compared against a real password. */
export function validatePasswordChange(form: PasswordForm): PasswordErrors {
  const errors: PasswordErrors = {}
  if (!form.current) errors.current = 'Enter your current password.'
  if (!form.next) errors.next = 'Enter a new password.'
  else if (form.next.length < MIN_PASSWORD_LENGTH) errors.next = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  else if (form.next === form.current) errors.next = 'Choose a password different from your current one.'
  if (!form.confirm) errors.confirm = 'Confirm your new password.'
  else if (form.confirm !== form.next) errors.confirm = 'Passwords do not match.'
  return errors
}

export const validateTwoFactorCode = (code: string): string | undefined =>
  /^\d{6}$/.test(code.trim()) ? undefined : 'Enter the 6-digit code (any six digits work in this demo).'
