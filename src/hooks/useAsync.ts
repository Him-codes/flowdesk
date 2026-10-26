import { useCallback, useEffect, useState, type DependencyList } from 'react'

export interface AsyncState<T> {
  /** Last successfully loaded value. Kept while a refetch is in flight so UIs can dim instead of blank. */
  data: T | undefined
  error: Error | null
  loading: boolean
  reload: () => void
}

/** Runs `load` on mount and whenever `deps` change; aborts stale requests. `reload()` re-runs it (used by Retry). */
export function useAsync<T>(load: (signal: AbortSignal) => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [state, setState] = useState<{ data: T | undefined; error: Error | null; loading: boolean }>({
    data: undefined,
    error: null,
    loading: true,
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState((s) => ({ data: s.data, error: null, loading: true }))
    load(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, error: null, loading: false })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setState((s) => ({ data: s.data, error: err instanceof Error ? err : new Error(String(err)), loading: false }))
      })
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])
  return { ...state, reload }
}
