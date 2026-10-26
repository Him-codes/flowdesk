export const DAY_MS = 86_400_000
export const HOUR_MS = 3_600_000

/** Fixed at module load so every dataset is generated relative to the same "now". */
export const NOW = Date.now()

const midnight = new Date(NOW)
midnight.setHours(0, 0, 0, 0)
export const START_OF_TODAY = midnight.getTime()

/** 0 for today, 1 for yesterday, and so on. */
export const daysAgoIndex = (timestamp: number) => Math.floor((START_OF_TODAY + DAY_MS - timestamp) / DAY_MS)
