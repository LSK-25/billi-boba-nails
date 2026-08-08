'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEventHandler } from 'react';
import AdminShell from '@/components/AdminShell';
import {
  createPreviewMedia,
  deletePreviewMedia,
  getAdminPreviewMedia,
  previewMediaSections,
  updatePreviewMediaStatus,
  type PreviewMediaItem,
  type PreviewMediaSection,
} from '@/lib/preview-media';

type LocalPreview = {
  url: string;
  kind: 'image' | 'video';
  fileName: string;
};

function sectionLabel(section: PreviewMediaSection) {
  return previewMediaSections.find((item) => item.value === section)?.label ?? section;
}

function readLocalPreview(
  event: ChangeEvent<HTMLInputElement>,
  onReady: (file: File | null, preview: LocalPreview | null) => void,
) {
  const file = event.target.files?.[0];

  if (!file) {
    onReady(null, null);
    return;
  }

  const kind = file.type.startsWith('video/') ? 'video' : 'image';

  onReady(file, {
    url: URL.createObjectURL(file),
    kind,
    fileName: file.name,
  });
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<PreviewMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [section, setSection] = useState<PreviewMediaSection>('shimmer_preview');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaHref, setCtaHref] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<LocalPreview | null>(null);

  const grouped = useMemo(() => {
    return previewMediaSections.map((currentSection) => ({
      ...currentSection,
      items: items.filter((item) => item.section === currentSection.value),
    }));
  }, [items]);

  async function loadItems() {
    setLoading(true);
    const nextItems = await getAdminPreviewMedia();
    setItems(nextItems);
    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, []);

  function resetForm() {
    setTitle('');
    setCaption('');
    setSection('shimmer_preview');
    setCtaLabel('');
    setCtaHref('');
    setSortOrder('0');
    setIsActive(true);
    setFile(null);
    setPreview(null);
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!file || saving) return;

    setSaving(true);
    setMessage('');

    try {
      await createPreviewMedia(
        {
          title: title.trim(),
          caption: caption.trim(),
          section,
          ctaLabel: ctaLabel.trim(),
          ctaHref: ctaHref.trim(),
          isActive,
          sortOrder: Number(sortOrder) || 0,
        },
        file,
      );

      setMessage('Preview media added.');
      resetForm();
      setShowForm(false);
      await loadItems();
    } catch (caughtError) {
      setMessage(caughtError instanceof Error ? caughtError.message : 'Could not add media.');
    } finally {
      setSaving(false);
    }
  };

  async function handleToggle(item: PreviewMediaItem) {
    setMessage('');

    try {
      await updatePreviewMediaStatus(item.id, !item.isActive);
      await loadItems();
    } catch (caughtError) {
      setMessage(caughtError instanceof Error ? caughtError.message : 'Could not update media.');
    }
  }

  async function handleDelete(item: PreviewMediaItem) {
    const confirmed = window.confirm(`Delete "${item.title}"?`);

    if (!confirmed) return;

    setMessage('');

    try {
      await deletePreviewMedia(item);
      await loadItems();
    } catch (caughtError) {
      setMessage(caughtError instanceof Error ? caughtError.message : 'Could not delete media.');
    }
  }

  return (
    <AdminShell
      eyebrow="Preview manager"
      title="Shimmer & launch media"
      description="Manually add videos, new coming photos and best-selling nail previews for the customer website."
      action={
        <button type="button" onClick={() => setShowForm((value) => !value)} className="btn-primary w-fit">
          {showForm ? 'Close form' : 'Add preview media'}
        </button>
      }
    >
      {message && (
        <div className="mb-5 rounded-[1.5rem] border border-white/60 bg-white/55 p-4 text-sm font-bold leading-6 text-[#6d5871]">
          {message}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 grid gap-6 rounded-[2rem] border border-white/60 bg-white/45 p-5 md:p-7">
          <div>
            <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Add media</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#756778]">
              Upload one video or photo. It can be used for shimmer previews, new coming designs, or previous best sellers.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
              Title
              <input className="input-field" value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>

            <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
              Section
              <select className="input-field" value={section} onChange={(event) => setSection(event.target.value as PreviewMediaSection)}>
                {previewMediaSections.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
              Sort order
              <input className="input-field" type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} />
            </label>

            <label className="flex items-center gap-3 rounded-[1.35rem] border border-white/60 bg-white/40 px-4 py-3 text-sm font-black text-[#4b3e51]">
              <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
              Show on website
            </label>
          </div>

          <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
            Caption
            <textarea className="input-field min-h-24" value={caption} onChange={(event) => setCaption(event.target.value)} />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
              Button label optional
              <input className="input-field" value={ctaLabel} onChange={(event) => setCtaLabel(event.target.value)} placeholder="Shop this look" />
            </label>

            <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
              Button link optional
              <input className="input-field" value={ctaHref} onChange={(event) => setCtaHref(event.target.value)} placeholder="/shop" />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
            Upload image/video
            <input
              className="input-field"
              type="file"
              accept="image/*,video/mp4,video/webm,video/quicktime"
              required
              onChange={(event) =>
                readLocalPreview(event, (nextFile, nextPreview) => {
                  setFile(nextFile);
                  setPreview(nextPreview);
                })
              }
            />
          </label>

          {preview && (
            <div className="overflow-hidden rounded-[1.7rem] border border-white/60 bg-white/40">
              {preview.kind === 'video' ? (
                <video src={preview.url} className="max-h-[360px] w-full object-cover" controls muted playsInline />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.url} alt={preview.fileName} className="max-h-[360px] w-full object-cover" />
              )}
              <p className="p-3 text-xs font-bold text-[#8a728d]">{preview.fileName}</p>
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary w-fit">
            {saving ? 'Uploading...' : 'Save media'}
          </button>
        </form>
      )}

      <div className="grid gap-6">
        {loading ? (
          <div className="liquid-glass rounded-[2rem] p-6">
            <p className="font-black text-[#34263c]">Loading media...</p>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.value} className="liquid-glass rounded-[2rem] p-5 md:p-7">
              <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
                <div>
                  <h2 className="font-display text-3xl font-black tracking-[-0.06em]">{group.label}</h2>
                  <p className="mt-1 text-sm font-semibold text-[#756778]">
                    {group.items.length} media item{group.items.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              {group.items.length === 0 ? (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-[#d8ccff] bg-white/35 p-5">
                  <p className="text-sm font-bold text-[#756778]">No media added here yet.</p>
                </div>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((item) => (
                    <article key={item.id} className="overflow-hidden rounded-[1.7rem] border border-white/60 bg-white/42">
                      <div className="aspect-[4/5] bg-[#f8f2ff]">
                        {item.mediaKind === 'video' ? (
                          <video src={item.mediaUrl} className="h-full w-full object-cover" controls muted playsInline />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.mediaUrl} alt={item.title} className="h-full w-full object-cover" />
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-black text-[#34263c]">{item.title}</p>
                            <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#8a728d]">
                              {sectionLabel(item.section)} • {item.mediaKind}
                            </p>
                          </div>

                          <span className="rounded-full bg-[#f4eaff] px-3 py-1 text-xs font-black text-[#6d3fb1]">
                            {item.isActive ? 'Live' : 'Hidden'}
                          </span>
                        </div>

                        {item.caption && <p className="mt-3 text-sm font-semibold leading-6 text-[#756778]">{item.caption}</p>}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button type="button" onClick={() => handleToggle(item)} className="btn-secondary px-4 py-2 text-xs">
                            {item.isActive ? 'Hide' : 'Show'}
                          </button>
                          <button type="button" onClick={() => handleDelete(item)} className="btn-ghost px-4 py-2 text-xs">
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}