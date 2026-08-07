export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_SIZE_MB = 5;

export const allowedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

export type CheckoutFieldInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  customerNote?: string;
};

export function validateCheckoutFields(input: CheckoutFieldInput) {
  const phoneDigits = input.customerPhone.replace(/\D/g, '');

  if (input.customerName.trim().length < 2 || input.customerName.trim().length > 80) {
    return 'Please enter a valid full name.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.customerEmail.trim())) {
    return 'Please enter a valid email address.';
  }

  if (!/^[0-9]{10,15}$/.test(phoneDigits)) {
    return 'Please enter a valid phone number.';
  }

  if (input.addressLine1.trim().length < 6 || input.addressLine1.trim().length > 180) {
    return 'Please enter a valid delivery address.';
  }

  if (input.city.trim().length < 2 || input.city.trim().length > 80) {
    return 'Please enter a valid city.';
  }

  if (input.state.trim().length < 2 || input.state.trim().length > 80) {
    return 'Please enter a valid state.';
  }

  if (!/^[0-9]{6}$/.test(input.postalCode.trim())) {
    return 'Please enter a valid 6-digit PIN code.';
  }

  if (input.customerNote && input.customerNote.trim().length > 500) {
    return 'Order note must be under 500 characters.';
  }

  return null;
}

export function validateImageFile(file: File, label = 'Image') {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `${label} must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`;
  }

  if (file.type && !allowedImageTypes.includes(file.type)) {
    return `${label} must be JPG, PNG, WEBP, HEIC or HEIF.`;
  }

  if (!file.type && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) {
    return `${label} must be JPG, PNG, WEBP, HEIC or HEIF.`;
  }

  return null;
}