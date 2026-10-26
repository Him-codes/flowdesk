import { useEffect, useRef, useState } from 'react'
import { readStored, subscribeToStorage, writeStored, type Parse } from '../utils/storage'

/**
 * useState backed by localStorage, kept in sync with other open tabs.
 * `parse` validates what was stored; it must be a stable (module-level) function.
 */
export function usePersistentState<T>(key: string, initial: T, parse?: Parse<T>) {
  const [value, setValue] = useState<T>(() => readStored(key, () => initial, parse))
  const initialRef = useRef(initial)

  useEffect(() => {
    writeStored(key, value)
  }, [key, value])

  // Another tab changed this key: adopt its value. Writing it back is a no-op (same JSON), so there is no ping-pong.
  useEffect(() => subscribeToStorage(key, () => setValue(readStored(key, () => initialRef.current, parse))), [key, parse])

  return [value, setValue] as const
}
