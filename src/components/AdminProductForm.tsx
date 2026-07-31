'use client';

import { useMemo, useState, type FormEventHandler } from 'react';
import { useRouter } from 'next/navigation';
import {
  createAdminProduct,
  makeProductSlug,
  setAdminProductStatus,
  updateAdminProduct,
  type AdminProduct,
  type AdminProductInput,
} from '@/lib/admin-products';
import { formatPrice } from '@/lib/utils';
import type { PreferredLength } from '@/types';

const lengthChoices: PreferredLength[] = ['Short', 'Medium', 'Long', 'Same as shown'];

function csvToArray(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function numberValue(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function AdminProductForm({
  mode,
  initialProduct,
}: {
  mode: 'new' | 'edit';
  initialProduct?: AdminProduct;
}) {
  const router = useRouter();

  const [name, setName] = useState(initialProduct?.name ?? '');
  const [slug, setSlug] = useState(initialProduct?.slug ?? '');
  const [designCode, setDesignCode] = useState(initialProduct?.designCode ?? '');
  const [category, setCategory] = useState(initialProduct?.category ?? '');
  const [priceInr, setPriceInr] = useState(String(initialProduct?.priceInr ?? 799));
  const [shape, setShape] = useState(initialProduct?.shape ?? 'Almond');
  const [finish, setFinish] = useState(initialProduct?.finish ?? 'Glossy');
  const [description, setDescription] = useState(initialProduct?.description ?? '');
  const [studioNote, setStudioNote] = useState(initialProduct?.studioNote ?? '');
  const [lengthOptions, setLengthOptions] = useState<PreferredLength[]>(initialProduct?.lengthOptions ?? ['Same as shown']);
  const [tags, setTags] = useState((initialProduct?.tags ?? []).join(', '));
  const [productionTimeDays, setProductionTimeDays] = useState(String(initialProduct?.productionTimeDays ?? 7));
  const [sortOrder, setSortOrder] = useState(String(initialProduct?.sortOrder ?? 0));
  const [status, setStatus] = useState<'active' | 'archived'>(initialProduct?.status ?? 'active');
  const [isFeatured, setIsFeatured] = useState(Boolean(initialProduct?.isFeatured));
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const previewPrice = useMemo(() => formatPrice(numberValue(priceInr, 0)), [priceInr]);

  function toggleLength(length: PreferredLength) {
    setLengthOptions((current) => {
      if (current.includes(length)) {
        const next = current.filter((item) => item !== length);
        return next.length ? next : ['Same as shown'];
      }

      return [...current, length];
    });
  }

  function handleNameChange(value: string) {
    setName(value);

    if (mode === 'new') {
      setSlug(makeProductSlug(value));
    }
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setMessage('');

    const input: AdminProductInput = {
      slug: makeProductSlug(slug || name),
      name: name.trim(),
      designCode: designCode.trim(),
      category: category.trim(),
      description: description.trim(),
      studioNote: studioNote.trim(),
      priceInr: numberValue(priceInr, 0),
      shape: shape.trim(),
      finish: finish.trim(),
      lengthOptions,
      tags: csvToArray(tags),
      productionTimeDays: numberValue(productionTimeDays, 7),
      status,
      isFeatured,
      sortOrder: numberValue(sortOrder, 0),
    };

    try {
      const savedProduct = mode === 'edit' && initialProduct
        ? await updateAdminProduct(initialProduct.id, input, files)
        : await createAdminProduct(input, files);

      setMessage('Product saved.');
      setFiles([]);

      if (savedProduct?.slug) {
        router.push(`/admin/products/${savedProduct.slug}/edit`);
        router.refresh();
      }
    } catch (caughtError) {
      setMessage(caughtError instanceof Error ? caughtError.message : 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  async function handleArchiveToggle() {
    if (!initialProduct || saving) return;

    setSaving(true);
    setMessage('');

    const nextStatus = initialProduct.status === 'archived' ? 'active' : 'archived';

    try {
      await setAdminProductStatus(initialProduct.id, nextStatus);
      setStatus(nextStatus);
      setMessage(nextStatus === 'archived' ? 'Product archived.' : 'Product restored.');
      router.refresh();
    } catch (caughtError) {
      setMessage(caughtError instanceof Error ? caughtError.message : 'Could not update product status.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
      <div className="grid gap-6">
        <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Product details</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
              Product name
              <input className="input-field" value={name} onChange={(event) => handleNameChange(event.target.value)} required />
            </label>

            <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
              Slug
              <input className="input-field" value={slug} onChange={(event) => setSlug(makeProductSlug(event.target.value))} required />
            </label>

            <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
              Design code
              <input className="input-field" value={designCode} onChange={(event) => setDesignCode(event.target.value)} placeholder="BNB-NEW-001" required />
            </label>

            <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
              Category
              <input className="input-field" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="French / Chrome / Cute" required />
            </label>

            <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
              Price
              <input className="input-field" type="number" min="0" value={priceInr} onChange={(event) => setPriceInr(event.target.value)} required />
            </label>

            <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
              Shape
              <input className="input-field" value={shape} onChange={(event) => setShape(event.target.value)} required />
            </label>

            <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
              Finish
              <input className="input-field" value={finish} onChange={(event) => setFinish(event.target.value)} required />
            </label>

            <label className="grid gap-2 text-sm font-black text-[#4b3e51]">
              Production days
              <input className="input-field" type="number" min="1" value={productionTimeDays} onChange={(event) => setProductionTimeDays(event.target.value)} required />
            </label>
          </div>

          <label className="mt-4 grid gap-2 text-sm font-black text-[#4b3e51]">
            Description
            <textarea className="input-field min-h-28 resize-y" value={description} onChange={(event) => setDescription(event.target.value)} required />
          </label>

          <label className="mt-4 grid gap-2 text-sm font-black text-[#4b3e51]">
            Studio note / product story
            <textarea className="input-field min-h-28 resize-y" value={studioNote} onChange={(event) => setStudioNote(event.target.value)} />
          </label>
        </div>

        <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Product photos</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#756778]">
            Upload clear product photos. The first uploaded photo becomes the main shop image if the product has no images yet.
          </p>

          {initialProduct?.images?.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {initialProduct.images.map((image) => (
                <div key={image.id} className="overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/40">
                  {image.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image.imageUrl} alt={image.altText ?? initialProduct.name} className="h-44 w-full object-cover" />
                  ) : (
                    <div className="grid h-44 place-items-center text-sm font-black text-[#8a728d]">No preview</div>
                  )}
                  <div className="p-3">
                    <p className="text-xs font-black text-[#6d5871]">{image.isPrimary ? 'Primary image' : 'Gallery image'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[1.5rem] border border-dashed border-[#cbb8ff] bg-white/35 p-5 text-sm font-semibold text-[#756778]">
              No product photos uploaded yet.
            </div>
          )}

          <label className="mt-5 grid gap-2 text-sm font-black text-[#4b3e51]">
            Upload new images
            <input
              className="input-field"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
          </label>

          {files.length > 0 && (
            <p className="mt-3 text-sm font-bold text-[#6d5871]">
              {files.length} new image{files.length === 1 ? '' : 's'} selected.
            </p>
          )}
        </div>
      </div>

      <aside className="grid h-fit gap-6">
        <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Publishing</h2>

          <label className="mt-5 grid gap-2 text-sm font-black text-[#4b3e51]">
            Status
            <select className="input-field" value={status} onChange={(event) => setStatus(event.target.value as 'active' | 'archived')}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          <label className="mt-4 flex items-center gap-3 text-sm font-black text-[#4b3e51]">
            <input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} />
            Featured product
          </label>

          <label className="mt-4 grid gap-2 text-sm font-black text-[#4b3e51]">
            Sort order
            <input className="input-field" type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} />
          </label>

          <div className="mt-5 rounded-[1.4rem] border border-white/60 bg-white/45 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8d738f]">Preview</p>
            <p className="mt-2 font-display text-3xl font-black tracking-[-0.06em]">{name || 'Product name'}</p>
            <p className="mt-1 text-sm font-bold text-[#6d5871]">{designCode || 'BNB-CODE'} • {previewPrice}</p>
          </div>

          {message && (
            <div className="mt-5 rounded-[1.35rem] border border-white/60 bg-white/55 p-4 text-sm font-bold leading-6 text-[#6d5871]">
              {message}
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary mt-5 w-full">
            {saving ? 'Saving...' : mode === 'edit' ? 'Save product' : 'Create product'}
          </button>

          {mode === 'edit' && initialProduct && (
            <button type="button" onClick={handleArchiveToggle} disabled={saving} className="btn-secondary mt-3 w-full">
              {initialProduct.status === 'archived' ? 'Restore product' : 'Archive product'}
            </button>
          )}
        </div>

        <div className="liquid-glass rounded-[2rem] p-5 md:p-7">
          <h2 className="font-display text-3xl font-black tracking-[-0.06em]">Options</h2>

          <p className="mt-5 text-sm font-black text-[#4b3e51]">Length options</p>
          <div className="mt-3 grid gap-3">
            {lengthChoices.map((length) => (
              <label key={length} className="flex items-center gap-3 rounded-[1.2rem] border border-white/60 bg-white/40 p-3 text-sm font-bold text-[#6d5871]">
                <input type="checkbox" checked={lengthOptions.includes(length)} onChange={() => toggleLength(length)} />
                {length}
              </label>
            ))}
          </div>

          <label className="mt-5 grid gap-2 text-sm font-black text-[#4b3e51]">
            Tags
            <input className="input-field" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="pastel, chrome, bridal" />
          </label>
        </div>
      </aside>
    </form>
  );
}