import { demoUser } from './user'

/** Demo team members (first names only). The first one is the signed-in user. */
export const TEAM = [demoUser.firstName, 'Amara', 'Daniel', 'Priya', 'Lucas'] as const

/**
 * Stable key stored on a task assigned to the signed-in user. The interface shows the current profile name
 * instead (see `useAssigneeLabel`), so renaming yourself in Settings updates every task you own.
 */
export const ME: string = TEAM[0]
