'use server';

import {
  getGalleryImages,
  getGalleryCategories,
  searchGalleryImages,
  getImageUrl
} from '@/lib/directus';
import { GalleryImage } from '@/types/gallery';

// Only images tagged with one of these categories in Directus are shown on the
// public Gallery page. Anything outside this allowlist is filtered out, even if
// it's published in Directus.
const ALLOWED_CATEGORIES = [
  'Awards & Recognition',
  'Ceremony',
  'Events',
  'Faculty & Presentations',
  'Our Facilities',
  'Facilities',
  'Patient Feedbacks',
  'General',
];

export async function getGalleryImagesAction(
  page: number = 1,
  category?: string,
  search?: string
): Promise<{
  data: GalleryImage[];
  total: number;
  page: number;
  totalPages: number;
}> {
  // If a specific category was requested but it's outside the allowlist, return nothing.
  if (category && !ALLOWED_CATEGORIES.includes(category)) {
    return { data: [], total: 0, page: 1, totalPages: 0 };
  }

  // Get ALL images by default, no pagination
  const result = await getGalleryImages(-1, 0, category, search);

  // Restrict to the allowlist (in case the "All" view pulls in unwanted categories)
  const filtered = result.data.filter(
    (image) => image.category && ALLOWED_CATEGORIES.includes(image.category)
  );

  // Add image URLs to the data
  const dataWithImageUrls = filtered.map(image => ({
    ...image,
    imageUrl: getImageUrl(image.image)
  }));

  return {
    ...result,
    data: dataWithImageUrls,
    total: dataWithImageUrls.length,
  };
}

export async function getGalleryCategoriesAction(): Promise<string[]> {
  const all = await getGalleryCategories();
  // Keep "All" first; then only the categories from the allowlist that actually
  // exist in Directus, preserving the allowlist's declared order.
  const allowed = ALLOWED_CATEGORIES.filter((cat) => all.includes(cat));
  return ['All', ...allowed];
}

export async function searchGalleryImagesAction(searchTerm: string): Promise<GalleryImage[]> {
  const results = await searchGalleryImages(searchTerm, 10);

  // Restrict to the allowlist
  const filtered = results.filter(
    (image) => image.category && ALLOWED_CATEGORIES.includes(image.category)
  );

  // Add image URLs to the results
  return filtered.map(image => ({
    ...image,
    imageUrl: getImageUrl(image.image)
  }));
}