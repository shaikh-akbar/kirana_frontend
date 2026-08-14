import { createContext, useContext } from 'react'

export const FirmContext = createContext(null)

export function useFirm() {
  const ctx = useContext(FirmContext)
  if (!ctx) throw new Error('useFirm must be used within FirmProvider')
  return ctx
}
