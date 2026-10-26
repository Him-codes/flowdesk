import { useSyncExternalStore } from 'react'
import { getDataRevision, subscribeToDataRevision } from '../data/revision'

/** Changes whenever the simulated server data changes. Use it as an effect/fetch dependency. */
export const useDataRevision = () => useSyncExternalStore(subscribeToDataRevision, getDataRevision)
