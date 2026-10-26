let revision = 0
const listeners = new Set<() => void>()

export const getDataRevision = () => revision

/** Called whenever the simulated "server" data changes (for example a customer is added) so dependants can refetch. */
export function bumpDataRevision(): void {
  revision += 1
  listeners.forEach((listener) => listener())
}

export function subscribeToDataRevision(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
