import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { NailSet, PreferredLength } from '@/types';

type ProductImageRow = {
  image_url: string | null;
  storage_path: string | null;
  alt_text: string | null;
  is_primary: boolean | null;
  sort_order: number | null;
};

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
  product_images: ProductImageRow[] | null;
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
  sort_order,
  product_images (
    image_url,
    storage_path,
    alt_text,
    is_primary,
    sort_order
  )
`;

const themes = [
  {
    color: 'Blush',
    tone: '#ffd5e3',
    accentTone: '#d7c5ff',
  },
  {
    color: 'Lavender',
    tone: '#d9c7ff',
    accentTone: '#ffe0ef',
  },
  {
    color: 'Mocha',
    tone: '#c2a08d',
    accentTone: '#cdbdff',
  },
  {
    color: 'Peach',
    tone: '#ffd5bd',
    accentTone: '#f7c0dc',
  },
  {
    color: 'Berry',
    tone: '#edaabd',
    accentTone: '#dacdff',
  },
  {
    color: 'Ivory',
    tone: '#fff1de',
    accentTone: '#e3d7ff',
  },
];

function getSupabaseProductClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createSupabaseClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

function normalizeLength(
  value?: string | null,
): PreferredLength | null {
  if (
    value === 'Short' ||
    value === 'Medium' ||
    value === 'Long' ||
    value === 'Same as shown'
  ) {
    return value;
  }

  return null;
}

function normalizeLengthOptions(
  values?: string[] | null,
): PreferredLength[] {
  const options = (values ?? [])
    .map((value) => normalizeLength(value))
    .filter(
      (value): value is PreferredLength =>
        Boolean(value),
    );

  return options.length
    ? options
    : ['Same as shown'];
}

function getGallery(
  images?: ProductImageRow[] | null,
) {
  return [...(images ?? [])]
    .sort((a, b) => {
      if (
        Boolean(a.is_primary) !==
        Boolean(b.is_primary)
      ) {
        return Boolean(a.is_primary)
          ? -1
          : 1;
      }

      return (
        (a.sort_order ?? 0) -
        (b.sort_order ?? 0)
      );
    })
    .map((image) => image.image_url)
    .filter(
      (value): value is string =>
        Boolean(value),
    );
}

function mapProductRow(
  row: ProductRow,
  index = 0,
): NailSet {
  const theme =
    themes[index % themes.length];

  const lengthOptions =
    normalizeLengthOptions(
      row.length_options,
    );

  const gallery =
    getGallery(row.product_images);

  return {
    id: row.slug,
    databaseId: row.id,

    code:
      row.design_code ??
      `BNB-${String(index + 1).padStart(3, '0')}`,

    name: row.name,

    category:
      row.category ??
      'Press-on set',

    length: lengthOptions[0],

    lengthOptions,

    shape:
      row.shape ??
      'Custom',

    finish:
      row.finish ??
      'Glossy',

    price:
      row.price_inr ??
      0,

    color:
      row.category ??
      theme.color,

    tone:
      theme.tone,

    accentTone:
      theme.accentTone,

    imageUrl:
      gallery[0] ??
      null,

    gallery,

    description:
      row.description ??
      'A made-to-order BILLi&BoBA press-on nail set.',

    story:
      row.studio_note ??
      'Designed by the BILLi&BoBA studio.',

    productionTime:
      `${row.production_time_days ?? 7} working days`,

    featured:
      Boolean(row.is_featured),

    archived:
      row.status === 'archived',
  };
}

export async function getActiveProducts(): Promise<NailSet[]> {
  const supabase =
    getSupabaseProductClient();

  if (!supabase) {
    console.error(
      'Supabase product client is not configured.',
    );

    return [];
  }

  const { data, error } =
    await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('status', 'active')
      .order('sort_order', {
        ascending: true,
      })
      .order('created_at', {
        ascending: false,
      });

  if (error) {
    console.error(
      'Failed to load active products:',
      error.message,
    );

    return [];
  }

  return (data ?? []).map(
    (row, index) =>
      mapProductRow(
        row as ProductRow,
        index,
      ),
  );
}

export async function getActiveProductBySlug(
  slug: string,
): Promise<NailSet | null> {
  const supabase =
    getSupabaseProductClient();

  if (!supabase) {
    console.error(
      'Supabase product client is not configured.',
    );

    return null;
  }

  const { data, error } =
    await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();

  if (error) {
    console.error(
      `Failed to load product "${slug}":`,
      error.message,
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return mapProductRow(
    data as ProductRow,
  );
}