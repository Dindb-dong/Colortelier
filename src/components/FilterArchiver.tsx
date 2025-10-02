import { useState } from 'react'
import { convertToWebpIfLarge, objectUrlFromFile } from '../utils/image'
import { type FilterArchive, useUIStore } from '../store/ui'

export default function FilterArchiver() {
  const addFilter = useUIStore((s) => s.addFilter)
  const [beforeFile, setBeforeFile] = useState<File | null>(null)
  const [afterFile, setAfterFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const onSave = async () => {
    if (!beforeFile || !afterFile) return alert('Before/After 이미지를 모두 선택해 주세요')
    setSaving(true)
    try {
      const [bConv, aConv] = await Promise.all([
        convertToWebpIfLarge(beforeFile),
        convertToWebpIfLarge(afterFile),
      ])
      const payload: FilterArchive = {
        id: `${Date.now()}`,
        beforeObjectUrl: objectUrlFromFile(bConv),
        afterObjectUrl: objectUrlFromFile(aConv),
        notes: notes || undefined,
        createdAt: Date.now(),
      }
      addFilter(payload)
      setBeforeFile(null)
      setAfterFile(null)
      setNotes('')
      alert('Saved (local only). Backend upload pending.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="container">
      <h2>Filter Archiving</h2>
      <div className="grid auto">
        <label>Before
          <input type="file" accept="image/*" onChange={(e) => setBeforeFile(e.target.files?.[0] ?? null)} />
        </label>
        <label>After
          <input type="file" accept="image/*" onChange={(e) => setAfterFile(e.target.files?.[0] ?? null)} />
        </label>
        <label>Notes (optional)
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Lightroom settings, etc." />
        </label>
      </div>
      <div className="row">
        <button className="primary button-cta" onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
      <p className="muted">Note: Saves locally, converts to WebP if images are large.</p>
    </section>
  )
}


