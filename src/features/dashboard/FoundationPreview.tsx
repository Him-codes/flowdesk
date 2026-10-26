import { useState } from 'react'
import { ChevronDown, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Badge, Button, Card, Dropdown, Input, Modal, Skeleton, Tabs, Toggle } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import s from './FoundationPreview.module.css'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'reports', label: 'Reports' },
]

/** Phase 1 review panel: exercises every UI primitive. Replaced by the real dashboard in Phase 2. */
export function FoundationPreview() {
  const toast = useToast()
  const [tab, setTab] = useState('overview')
  const [enabled, setEnabled] = useState(true)
  const [open, setOpen] = useState(false)

  return (
    <Card as="section" className={s.preview} aria-labelledby="preview-title">
      <div>
        <h2 id="preview-title" className={s.title}>
          Foundation preview
        </h2>
        <p className={s.note}>Every Phase 1 primitive, wired up for review. This panel is replaced by the real dashboard next.</p>
      </div>

      <div className={s.group}>
        <h3 className={s.label}>Buttons</h3>
        <div className={s.row}>
          <Button icon={<Plus size={16} />}>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>

      <div className={s.group}>
        <h3 className={s.label}>Badges</h3>
        <div className={s.row}>
          <Badge tone="success">Completed</Badge>
          <Badge tone="warning">Pending</Badge>
          <Badge tone="error">Failed</Badge>
          <Badge tone="accent">New</Badge>
          <Badge tone="info">In progress</Badge>
          <Badge>Inactive</Badge>
        </div>
      </div>

      <div className={s.group}>
        <h3 className={s.label}>Toasts, dialog and menu</h3>
        <div className={s.row}>
          <Button size="sm" variant="secondary" onClick={() => toast.success('Preferences saved.')}>
            Success toast
          </Button>
          <Button size="sm" variant="secondary" onClick={() => toast.error('Could not load customers. Try again.')}>
            Error toast
          </Button>
          <Button size="sm" variant="secondary" onClick={() => toast.info('This is demo data.')}>
            Info toast
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
            Open dialog
          </Button>
          <Dropdown
            label="Example actions"
            align="start"
            trigger={
              <>
                Actions <ChevronDown size={16} aria-hidden="true" />
              </>
            }
            items={[
              { id: 'edit', label: 'Edit', icon: <Pencil size={16} aria-hidden="true" />, onSelect: () => toast.info('Edit selected.') },
              { id: 'delete', label: 'Delete', icon: <Trash2 size={16} aria-hidden="true" />, danger: true, onSelect: () => toast.success('Item deleted.') },
            ]}
          />
        </div>
      </div>

      <div className={s.group}>
        <h3 className={s.label}>Tabs</h3>
        <div>
          <Tabs tabs={TABS} value={tab} onChange={setTab} label="Preview sections" idPrefix="preview" />
          <div role="tabpanel" id={`preview-panel-${tab}`} aria-labelledby={`preview-tab-${tab}`} className={s.panel}>
            Showing the {tab} panel.
          </div>
        </div>
      </div>

      <div className={s.group}>
        <h3 className={s.label}>Form controls</h3>
        <div className={s.field}>
          <Input label="Search customers" placeholder="Name, email or company" icon={<Search size={16} />} hint="Search and filtering arrive with the Customers page." />
        </div>
        <div className={s.field}>
          <Toggle label="Payment notifications" description="Demo toggle, not persisted yet." checked={enabled} onChange={setEnabled} />
        </div>
      </div>

      <div className={s.group}>
        <h3 className={s.label}>Loading state</h3>
        <div className={s.stack} aria-busy="true" aria-label="Loading example">
          <Skeleton height={20} width="60%" />
          <Skeleton height={14} />
          <Skeleton height={14} width="85%" />
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Example dialog"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setOpen(false)
                toast.success('Dialog confirmed.')
              }}
            >
              Confirm
            </Button>
          </>
        }
      >
        <p>Focus is trapped here. Press Escape, use the close button, or click outside to dismiss. Focus returns to the button that opened it.</p>
      </Modal>
    </Card>
  )
}
