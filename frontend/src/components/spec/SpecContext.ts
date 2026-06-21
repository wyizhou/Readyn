import { createContext, useContext } from 'react'

/** Global "实现批注" (implementation annotation) toggle, provided by <App/>. */
export const SpecContext = createContext(false)

export function useSpec(): boolean {
  return useContext(SpecContext)
}
