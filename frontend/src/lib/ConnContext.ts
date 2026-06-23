import { createContext, useContext } from 'react'

// Global "is a data source connected" flag. Drives every module's empty state.
// In production it reflects the real Garmin login result (the design's demo
// ConnToggle is intentionally not implemented). Defaults to true so isolated
// component tests render the data state unless they wrap with a false provider.
export const ConnContext = createContext<boolean>(true)

export const useConn = (): boolean => useContext(ConnContext)
