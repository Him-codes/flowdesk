const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const isValidEmail = (value: string) => EMAIL.test(value.trim())
