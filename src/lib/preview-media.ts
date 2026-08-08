import { createClient } from '@/lib/supabase/client';

export type PreviewMediaSection = 'shimmer_preview' | 'new_coming' | 'best_seller';
export type PreviewMediaKind = 'image' | 'video';

export type PreviewMediaItem = {
  id: string;
  title: string;
  caption: string;
  section: PreviewMediaSection;
  mediaKind: PreviewMediaKind;
  mediaUrl: string;
  storagePath: string;
  ctaLabel: string;
  ctaHref: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
};

export type PreviewMediaInput = {
  title: string;
  caption: string;
  section: PreviewMediaSection;
  ctaLabel: string;
  ctaHref: string;
  isActive: boolean;
  sortOrder: number;
};

type PreviewMediaRow = {
  id: string;
  title: string;
  caption: string | null;
  section: PreviewMediaSection;
  media_kind: PreviewMediaKind;
  media_url: string | null;
  storage_path: string | null;
  cta_label: string | null;
  cta_href: string | null;
  is_active: boolean | null;
  sort_order: number | null;
  created_at: string;
};

const PREVIEW_MEDIA_SELECT = `
  id,
  title,
  caption,
  section,
  media_kind,
  media_url,
  storage_path,
  cta_label,
  cta_href,
  is_active,
  sort_order,
  created_at
`;

export const previewMediaSections: { value: PreviewMediaSection; label: string }[] = [
  { value: 'shimmer_preview', label: 'Shimmer Preview' },
  { value: 'new_coming', label: 'New Coming' },
  { value: 'best_seller', label: 'Best Seller' },
];

function mapPreviewMedia(row: PreviewMediaRow): PreviewMediaItem {
  return {
    id: row.id,
    title: row.title,
    caption: row.caption ?? '',
    section: row.section,
    mediaKind: row.media_kind,
    mediaUrl: row.media_url ?? '',
    storagePath: row.storage_path ?? '',
    ctaLabel: row.cta_label ?? '',
    ctaHref: row.cta_href ?? '',
    isActive: Boolean(row.is_active),
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  };
}

function cleanFileName(fileName: string) {
  return (
    fileName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'preview-media'
  );
}

function getMediaKind(file: File): PreviewMediaKind {
  return file.type.startsWith('video/') ? 'video' : 'image';
}

export async function getAdminPreviewMedia(): Promise<PreviewMediaItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('preview_media')
    .select(PREVIEW_MEDIA_SELECT)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return (data as PreviewMediaRow[]).map(mapPreviewMedia);
}

export async function getActivePreviewMedia(): Promise<PreviewMediaItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('preview_media')
    .select(PREVIEW_MEDIA_SELECT)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return (data as PreviewMediaRow[]).map(mapPreviewMedia);
}

export async function createPreviewMedia(input: PreviewMediaInput, file: File) {
  const supabase = createClient();
  const mediaKind = getMediaKind(file);
  const randomPart =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now());
  const storagePath = `${input.section}/${randomPart}-${cleanFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage.from('preview-media').upload(storagePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from('preview-media').getPublicUrl(storagePath);

  const { error } = await supabase.from('preview_media').insert({
    title: input.title,
    caption: input.caption || null,
    section: input.section,
    media_kind: mediaKind,
    media_url: data.publicUrl,
    storage_path: storagePath,
    cta_label: input.ctaLabel || null,
    cta_href: input.ctaHref || null,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updatePreviewMediaStatus(id: string, isActive: boolean) {
  const supabase = createClient();

  const { error } = await supabase.from('preview_media').update({ is_active: isActive }).eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deletePreviewMedia(item: PreviewMediaItem) {
  const supabase = createClient();

  const { error: deleteError } = await supabase.from('preview_media').delete().eq('id', item.id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (item.storagePath) {
    await supabase.storage.from('preview-media').remove([item.storagePath]);
  }
}