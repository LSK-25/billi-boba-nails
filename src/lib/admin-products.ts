import { createClient } from '@/lib/supabase/client';
import type { PreferredLength } from '@/types';

export type AdminProductImage = {
  id: string;
  imageUrl: string | null;
  storagePath: string | null;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  designCode: string;
  category: string;
  description: string;
  studioNote: string;
  priceInr: number;
  shape: string;
  finish: string;
  lengthOptions: PreferredLength[];
  tags: string[];
  productionTimeDays: number;
  status: 'active' | 'archived';
  isFeatured: boolean;
  sortOrder: number;
  images: AdminProductImage[];
};

export type AdminProductInput = {
  slug: string;
  name: string;
  designCode: string;
  category: string;
  description: string;
  studioNote: string;
  priceInr: number;
  shape: string;
  finish: string;
  lengthOptions: PreferredLength[];
  tags: string[];
  productionTimeDays: number;
  status: 'active' | 'archived';
  isFeatured: boolean;
  sortOrder: number;
};

type ProductImageRow = {
  id: string;
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

const ADMIN_PRODUCT_SELECT = `
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
    id,
    image_url,
    storage_path,
    alt_text,
    is_primary,
    sort_order
  )
`;

const allowedLengths: PreferredLength[] = ['Short', 'Medium', 'Long', 'Same as shown'];

function normalizeLength(value: string): PreferredLength | null {
  return allowedLengths.includes(value as PreferredLength) ? (value as PreferredLength) : null;
}

function normalizeLengthOptions(values?: string[] | null): PreferredLength[] {
  const options = (values ?? [])
    .map((value) => normalizeLength(value))
    .filter((value): value is PreferredLength => Boolean(value));

  return options.length ? options : ['Same as shown'];
}

function cleanFileName(fileName: string) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'product-image.jpg';
}

export function makeProductSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function mapProduct(row: ProductRow): AdminProduct {
  const images = [...(row.product_images ?? [])]
    .sort((a, b) => {
      if (Boolean(a.is_primary) !== Boolean(b.is_primary)) {
        return Boolean(a.is_primary) ? -1 : 1;
      }

      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    })
    .map((image) => ({
      id: image.id,
      imageUrl: image.image_url,
      storagePath: image.storage_path,
      altText: image.alt_text,
      isPrimary: Boolean(image.is_primary),
      sortOrder: image.sort_order ?? 0,
    }));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    designCode: row.design_code ?? '',
    category: row.category ?? '',
    description: row.description ?? '',
    studioNote: row.studio_note ?? '',
    priceInr: row.price_inr ?? 0,
    shape: row.shape ?? '',
    finish: row.finish ?? '',
    lengthOptions: normalizeLengthOptions(row.length_options),
    tags: row.tags ?? [],
    productionTimeDays: row.production_time_days ?? 7,
    status: row.status === 'archived' ? 'archived' : 'active',
    isFeatured: Boolean(row.is_featured),
    sortOrder: row.sort_order ?? 0,
    images,
  };
}

async function uploadProductImages({
  productId,
  productName,
  files,
  existingImageCount,
}: {
  productId: string;
  productName: string;
  files: File[];
  existingImageCount: number;
}) {
  if (files.length === 0) return;

  const supabase = createClient();
  const rows = [];

  for (const [index, file] of files.entries()) {
    const storagePath = `${productId}/${Date.now()}-${index}-${cleanFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg',
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(storagePath);

    rows.push({
      product_id: productId,
      storage_path: storagePath,
      image_url: data.publicUrl,
      alt_text: productName,
      is_primary: existingImageCount === 0 && index === 0,
      sort_order: existingImageCount + index,
    });
  }

  const { error } = await supabase.from('product_images').insert(rows);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .select(ADMIN_PRODUCT_SELECT)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return (data as ProductRow[]).map(mapProduct);
}

export async function getAdminProduct(identifier: string): Promise<AdminProduct | null> {
  const cleanIdentifier = decodeURIComponent(identifier).trim();

  if (!cleanIdentifier) return null;

  const supabase = createClient();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanIdentifier);
  const lookupColumns = isUuid ? ['id', 'slug'] : ['slug'];

  for (const column of lookupColumns) {
    const { data, error } = await supabase
      .from('products')
      .select(ADMIN_PRODUCT_SELECT)
      .eq(column, cleanIdentifier)
      .maybeSingle();

    if (data) return mapProduct(data as ProductRow);

    if (error) {
      console.error(`Product lookup failed for ${column}:`, error.message);
    }
  }

  return null;
}

export async function createAdminProduct(input: AdminProductInput, files: File[] = []) {
  const supabase = createClient();

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      slug: input.slug,
      name: input.name,
      design_code: input.designCode,
      category: input.category,
      description: input.description,
      studio_note: input.studioNote,
      price_inr: input.priceInr,
      shape: input.shape,
      finish: input.finish,
      length_options: input.lengthOptions,
      tags: input.tags,
      production_time_days: input.productionTimeDays,
      status: input.status,
      is_featured: input.isFeatured,
      sort_order: input.sortOrder,
    })
    .select(ADMIN_PRODUCT_SELECT)
    .single();

  if (error || !product) {
    throw new Error(error?.message ?? 'Could not create product.');
  }

  await uploadProductImages({
    productId: product.id,
    productName: input.name,
    files,
    existingImageCount: 0,
  });

  return getAdminProduct(product.slug);
}

export async function updateAdminProduct(productId: string, input: AdminProductInput, files: File[] = []) {
  const supabase = createClient();

  const { data: product, error } = await supabase
    .from('products')
    .update({
      slug: input.slug,
      name: input.name,
      design_code: input.designCode,
      category: input.category,
      description: input.description,
      studio_note: input.studioNote,
      price_inr: input.priceInr,
      shape: input.shape,
      finish: input.finish,
      length_options: input.lengthOptions,
      tags: input.tags,
      production_time_days: input.productionTimeDays,
      status: input.status,
      is_featured: input.isFeatured,
      sort_order: input.sortOrder,
    })
    .eq('id', productId)
    .select(ADMIN_PRODUCT_SELECT)
    .single();

  if (error || !product) {
    throw new Error(error?.message ?? 'Could not update product.');
  }

  await uploadProductImages({
    productId: product.id,
    productName: input.name,
    files,
    existingImageCount: product.product_images?.length ?? 0,
  });

  return getAdminProduct(product.slug);
}

export async function setAdminProductStatus(productId: string, status: 'active' | 'archived') {
  const supabase = createClient();

  const { error } = await supabase
    .from('products')
    .update({ status })
    .eq('id', productId);

  if (error) {
    throw new Error(error.message);
  }
}
export async function deleteAdminProduct(product: AdminProduct) {
  const supabase = createClient();

  const { count, error: orderCheckError } = await supabase
    .from('order_items')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', product.id);

  if (orderCheckError) {
    throw new Error(orderCheckError.message);
  }

  if ((count ?? 0) > 0) {
    throw new Error('This product already has orders. Archive it instead so order history stays safe.');
  }

  const storagePaths = product.images
    .map((image) => image.storagePath)
    .filter((path): path is string => Boolean(path));

  if (storagePaths.length > 0) {
    await supabase.storage.from('product-images').remove(storagePaths);
  }

  const { error: imageDeleteError } = await supabase
    .from('product_images')
    .delete()
    .eq('product_id', product.id);

  if (imageDeleteError) {
    throw new Error(imageDeleteError.message);
  }

  const { error: productDeleteError } = await supabase
    .from('products')
    .delete()
    .eq('id', product.id);

  if (productDeleteError) {
    throw new Error(productDeleteError.message);
  }
}