import { useCallback } from 'react'
import { usePreferences } from '../../context/PreferencesContext'
import { ME } from '../../data/team'
import { firstName } from '../../utils/format'

/**
 * Tasks assigned to the signed-in user store a stable key (`ME`); this shows the current profile name instead,
 * so renaming yourself in Settings updates every task you own. Other team members' names pass through unchanged.
 */
export function useAssigneeLabel(): (assignee: string) => string {
  const { profile } = usePreferences()
  const me = firstName(profile.name)
  return useCallback((assignee: string) => (assignee === ME ? me : assignee), [me])
}
