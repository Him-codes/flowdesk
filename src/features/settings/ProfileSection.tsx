import { useRef, useState, type FormEvent } from 'react'
import { Trash2, Upload } from 'lucide-react'
import { Avatar, Button, Input, Modal } from '../../components/ui'
import { usePreferences } from '../../context/PreferencesContext'
import { useToast } from '../../context/ToastContext'
import type { Profile } from '../../types'
import { fileToAvatarDataUrl, type AvatarCrop } from '../../utils/image'
import { SettingsSection } from './SettingsSection'
import { PROFILE_FIELD_ORDER, validateProfile, type ProfileErrors } from './validation'
import s from './ProfileSection.module.css'

export function ProfileSection() {
  const { profile, updateProfile } = usePreferences()
  const toast = useToast()
  const [draft, setDraft] = useState<Profile>(profile)
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [photoDraft, setPhotoDraft] = useState<{ file: File; url: string } | null>(null)
  const [crop, setCrop] = useState<AvatarCrop>({ zoom: 1, x: 50, y: 50 })
  const fileInput = useRef<HTMLInputElement>(null)

  const dirty = JSON.stringify(draft) !== JSON.stringify(profile)

  const setField = (field: keyof Profile, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const onPhotoChosen = (file: File | undefined) => {
    if (!file) return
    setPhotoError(null)
    if (!file.type.startsWith('image/')) {
      setPhotoError('Choose an image file (PNG, JPG, GIF or WebP).')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Choose an image smaller than 5 MB.')
      return
    }
    if (photoDraft) URL.revokeObjectURL(photoDraft.url)
    setCrop({ zoom: 1, x: 50, y: 50 })
    setPhotoDraft({ file, url: URL.createObjectURL(file) })
  }

  const closePhotoEditor = () => {
    if (photoDraft) URL.revokeObjectURL(photoDraft.url)
    setPhotoDraft(null)
  }

  const saveCroppedPhoto = async () => {
    if (!photoDraft) return
    setProcessing(true)
    setPhotoError(null)
    try {
      const avatar = await fileToAvatarDataUrl(photoDraft.file, 192, crop)
      setField('avatar', avatar)
      closePhotoEditor()
      toast.success('Profile photo updated. Save your profile to keep the change.')
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'That image could not be used.')
    } finally {
      setProcessing(false)
    }
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const found = validateProfile(draft)
    const firstInvalid = PROFILE_FIELD_ORDER.find((field) => found[field])
    if (firstInvalid) {
      setErrors(found)
      document.getElementById(`profile-${firstInvalid}`)?.focus()
      return
    }
    const saved: Profile = { ...draft, name: draft.name.trim(), email: draft.email.trim(), company: draft.company.trim() }
    updateProfile(saved)
    setDraft(saved)
    toast.success('Profile saved.')
  }

  return (
    <SettingsSection id="settings-profile" title="Profile" description="How you appear across FlowDesk. Changes show in the sidebar and top bar once saved.">
      <div className={s.photo}>
        <Avatar name={draft.name || 'Profile'} src={draft.avatar || undefined} size={72} />
        <div className={s.photoText}>
          <span className={s.photoLabel}>Profile image</span>
          <div className={s.photoActions}>
            <Button variant="secondary" size="sm" icon={<Upload size={16} />} loading={processing} onClick={() => fileInput.current?.click()}>
              Upload photo
            </Button>
            {draft.avatar && (
              <Button variant="ghost" size="sm" icon={<Trash2 size={16} />} onClick={() => setField('avatar', '')}>
                Remove photo
              </Button>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              onPhotoChosen(file)
            }}
          />
          {photoError && (
            <p className={s.error} role="alert">
              {photoError}
            </p>
          )}
        </div>
      </div>

      <form className={s.form} noValidate onSubmit={onSubmit}>
        <Input id="profile-name" label="Name" required autoComplete="off" value={draft.name} error={errors.name} onChange={(e) => setField('name', e.target.value)} />
        <Input id="profile-email" label="Email" type="email" required autoComplete="off" value={draft.email} error={errors.email} onChange={(e) => setField('email', e.target.value)} />
        <Input id="profile-company" label="Company" autoComplete="off" value={draft.company} error={errors.company} onChange={(e) => setField('company', e.target.value)} />
        <div className={s.actions}>
          <Button type="submit" disabled={!dirty || processing}>
            Save changes
          </Button>
          {dirty && (
            <Button
              variant="ghost"
              onClick={() => {
                setDraft(profile)
                setErrors({})
                setPhotoError(null)
              }}
            >
              Discard changes
            </Button>
          )}
        </div>
        <p className={s.note}>Your profile, including any photo, is stored only in this browser.</p>
      </form>
      <Modal
        open={Boolean(photoDraft)}
        onClose={closePhotoEditor}
        title="Position profile photo"
        footer={
          <div className={s.cropActions}>
            <Button variant="ghost" onClick={closePhotoEditor}>Cancel</Button>
            <Button onClick={() => void saveCroppedPhoto()} loading={processing} disabled={!photoDraft || processing}>Use photo</Button>
          </div>
        }
      >
        {photoDraft && (
          <div className={s.cropEditor}>
            <p className={s.cropHelp}>Adjust the zoom and position, then choose Use photo.</p>
            <div className={s.cropPreview}>
              <img
                src={photoDraft.url}
                alt="Profile photo crop preview"
                style={{ objectPosition: `${crop.x}% ${crop.y}%`, transform: `scale(${crop.zoom})` }}
              />
            </div>
            <label className={s.cropControl}>
              <span>Zoom</span>
              <input aria-label="Photo zoom" type="range" min="1" max="3" step="0.05" value={crop.zoom} onChange={(event) => setCrop((value) => ({ ...value, zoom: Number(event.target.value) }))} />
            </label>
            <label className={s.cropControl}>
              <span>Horizontal position</span>
              <input aria-label="Photo horizontal position" type="range" min="0" max="100" value={crop.x} onChange={(event) => setCrop((value) => ({ ...value, x: Number(event.target.value) }))} />
            </label>
            <label className={s.cropControl}>
              <span>Vertical position</span>
              <input aria-label="Photo vertical position" type="range" min="0" max="100" value={crop.y} onChange={(event) => setCrop((value) => ({ ...value, y: Number(event.target.value) }))} />
            </label>
          </div>
        )}
      </Modal>
    </SettingsSection>
  )
}
