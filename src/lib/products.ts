import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { NailSet, PreferredLength } from '@/types';
import { nailSets } from '@/lib/mock-data';

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  design_code: string | null;
  category: string | null;
  description: string | null;
  studio_note: string | null;
  price_inr: number | null;
  shape: string | null;
  finish: string | null;
  length_options: string[] | null;
  tags: string[] | null;
  production_time_days: number | null;
  status: string | null;
  is_featured: boolean | null;
  sort_order: number | null;
};

const PRODUCT_SELECT = `
  id,
  slug,
  name,
  design_code,
  category,
  description,
  studio_note,
  price_inr,
  shape,
  finish,
  length_options,
  tags,
  production_time_days,
  status,
  is_featured,
  sort_order
`;

const themes = [
  { color: 'Blush pink', tone: '#ffd5e3', accentTone: '#d7c5ff' },
  { color: 'Lavender', tone: '#d9c7ff', accentTone: '#ffe0ef' },
  { color: 'Mocha shimmer', tone: '#c2a08d', accentTone: '#cdbdff' },
  { color: 'Peach chrome', tone: '#ffd5bd', accentTone: '#f7c0dc' },
  { color: 'Berry pink', tone: '#edaabd', accentTone: '#dacdff' },
  { color: 'Ivory pearl', tone: '#fff1de', accentTone: '#e3d7ff' },
];

const themeBySlug: Record<string, { color: string; tone: string; accentTone: string }> = {
  'blush-boba-french': themes[0],
  'lavender-milk-glaze': themes[1],
  'cat-eye-mocha': themes[2],
  'peach-cloud-chrome': themes[3],
  'berry-bow-set': themes[4],
};

function getSupabaseProductClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function normalizeLength(value?: string | null): PreferredLength | null {
  if (value === 'Short' || value === 'Medium' || value === 'Long' || value === 'Same as shown') {
    return value;
  }

  return null;
}

function normalizeLengthOptions(values?: string[] | null): PreferredLength[] {
  const options = (values ?? [])
    .map((value) => normalizeLength(value))
    .filter((value): value is PreferredLength => Boolean(value));

  return options.length ? options : ['Same as shown'];
}

function mapProductRow(row: ProductRow, index = 0): NailSet {
  const fallbackTheme = themes[index % themes.length];
  const theme = themeBySlug[row.slug] ?? fallbackTheme;
  const lengthOptions = normalizeLengthOptions(row.length_options);

  return {
    id: row.slug,
    code: row.design_code ?? `BNB-${String(index + 1).padStart(3, '0')}`,
    name: row.name,
    category: row.category ?? 'Press-on set',
    length: lengthOptions[0],
    lengthOptions,
    shape: row.shape ?? 'Custom',
    finish: row.finish ?? 'Glossy',
    price: row.price_inr ?? 0,
    color: theme.color,
    tone: theme.tone,
    accentTone: theme.accentTone,
    description: row.description ?? 'A made-to-order BILLi&BoBA press-on nail set.',
    story: row.studio_note ?? 'Designed by the BILLi&BoBA studio.',
    productionTime: `${row.production_time_days ?? 7} working days`,
    featured: Boolean(row.is_featured),
    archived: row.status === 'archived',
  };
}

export async function getActiveProducts(): Promise<NailSet[]> {
  const supabase = getSupabaseProductClient();

  if (!supabase) return nailSets;

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('status', 'active')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error || !data?.length) {
    return nailSets;
  }

  return data.map((row, index) => mapProductRow(row as ProductRow, index));
}

export async function getActiveProductBySlug(slug: string): Promise<NailSet | null> {
  const supabase = getSupabaseProductClient();

  if (!supabase) {
    return nailSets.find((set) => set.id === slug) ?? null;
  }

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();

  if (error || !data) {
    return nailSets.find((set) => set.id === slug) ?? null;
  }

  return mapProductRow(data as ProductRow);
}