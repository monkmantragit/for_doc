// @ts-nocheck
import { createDirectus, rest, readItems, readItem, createItem, updateItem, deleteItem, type RestCommand, aggregate } from '@directus/sdk';
import { ProcedureSurgery } from '@/types/procedure-surgery';
import { GalleryImage, GalleryCategory } from '@/types/gallery';
import { ClinicalVideo, VideoCategory } from '@/types/clinical-videos';
import { StaffMember } from '@/types/staff';
import { Publication } from '@/types/publications';

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;

// Prefer dedicated admin token on the server, but gracefully fall back to the
// public token (read-only) if that is all we have. This makes local/dev
// setups easier because we often only configure a public token.
const directusAdminToken = process.env.DIRECTUS_ADMIN_TOKEN;
const directusPublicToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;

// Use whichever token is available.  This value is used for **server-side only**
// requests (never exposed to the browser bundle) and for generating signed
// image URLs when necessary.
const directusToken = directusAdminToken || directusPublicToken || '';

// Ensure the public Directus URL is provided (required for both client and server)
if (!directusUrl) {
  throw new Error('Directus configuration required: NEXT_PUBLIC_DIRECTUS_URL is not set.');
}

// We only initialise the authenticated Directus client on the **server** to
// avoid exposing any secret tokens in the browser bundle.  If we don't have an
// admin token we still try to create the client with the public one so that
// read-only queries succeed.

const client: any = (typeof window === 'undefined') ? (() => {
  // Build the Directus REST client.  If a token is available we attach it for
  // authenticated requests; otherwise we fall back to anonymous (public) access.
  const restMiddleware = directusToken ? {
    onRequest: (options: any) => ({
      ...options,
      cache: 'no-store', // CRITICAL: Disable caching for production
      headers: {
        ...options.headers,
        Authorization: `Bearer ${directusToken}`,
      },
    }),
  } : {
    onRequest: (options: any) => ({
      ...options,
      cache: 'no-store', // CRITICAL: Disable caching for production
    }),
  };

  return createDirectus(directusUrl).with(rest(restMiddleware));
})() : null;

// Helper function to create a public client
function createPublicClient() {
  return createDirectus(directusUrl).with(rest({
    onRequest: (options: any) => ({
      ...options,
      cache: 'no-store', // CRITICAL: Disable caching for production
      headers: {
        ...options.headers,
        Authorization: `Bearer ${directusPublicToken}`,
      },
    }),
  }));
}

// Helper function to handle Directus response
function handleDirectusResponse<T>(response: any): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (response.data && Array.isArray(response.data)) return response.data;
  return [];
}

export interface DirectusFile {
  id: string;
  url: string;
  width?: number;
  height?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  featured_image_url: string;
  excerpt: string;
  date_created: string;
  content_html: string;
  content_text: string;
  category: string;
  reading_time: number;
  status: string;
  meta_title?: string;
  meta_description?: string;
  source_url?: string;
  is_featured?: boolean;
}

export interface EducationalContent {
  id: string;
  title: string;
  slug: string;
  featured_image_url: string;
  content_html: string;
  content_text: string;
  content_length: number;
  category: string;
  educational_category: string;
  learning_level: string;
  target_audience: string;
  parent_slug: string;
  date_created: string;
  date_updated: string;
  status: string;
  meta_title?: string;
  meta_description?: string;
  source_url?: string;
  canonical_url?: string;
}

export interface LandingPage {
  id: string;
  title: string;
  slug: string;
  featured_image_url: string;
  content_html: string;
  content_text: string;
  content_length: number;
  category: string;
  location: string;
  service_focus: string;
  date_created: string;
  date_updated: string;
  status: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  source_url?: string;
  parent_slug?: string;
}

interface DirectusSchema {
  blog_content: BlogPost[];
  educational_content: EducationalContent[];
  medical_procedures: ProcedureSurgery[];
  gallery: GalleryImage[];
  clinical_videos: ClinicalVideo[];
  staff_info: StaffMember[];
  publications: Publication[];
  landing_pages: LandingPage[];
}

function toAssetUrl(fileId: string): string {
  if (!fileId) return '/images/default-blog-image.webp';
  
  // Check if fileId is already a full URL (starts with http)
  if (fileId.startsWith('http')) {
    return fileId; // Return as-is if it's already a full URL
  }
  
  return `${directusUrl}/assets/${fileId}`;
}

// Function to get image URL with proper handling - EXPORTED for use in components
export function getImageUrl(imageId: string | null): string {
  if (!imageId) return '/images/default-blog.jpg';
  
  // Check if imageId is already a full URL (starts with http)
  if (imageId.startsWith('http')) {
    return imageId; // Return as-is if it's already a full URL
  }
  
  // If we have a token (admin or public), append it. Otherwise rely on the asset
  // being publicly readable.
  const tokenQuery = directusToken ? `?access_token=${directusToken}` : '';
  return `${directusUrl}/assets/${imageId}${tokenQuery}`;
}

// Function to get public image URL (without admin token) - safer for client-side
export function getPublicImageUrl(imageId: string | null): string {
  if (!imageId) return '/images/default-blog.jpg';
  
  // Check if imageId is already a full URL (starts with http)
  if (imageId.startsWith('http')) {
    return imageId; // Return as-is if it's already a full URL
  }
  
  // Public URL without admin token - works in client and server
  return `${directusUrl}/assets/${imageId}`;
}

// Function to get all blog posts
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const activeClient = client || createPublicClient();
    if (!activeClient) {
      console.error('Failed to create Directus client');
      return [];
    }
    
    const response = await activeClient.request(
      readItems('blog_content', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'excerpt',
          'date_created',
          'content_html',
          'content_text',
          'category',
          'reading_time',
          'status',
          'meta_title',
          'meta_description',
          'source_url',
          'is_featured'
        ]
      })
    );

    const data = handleDirectusResponse<BlogPost>(response);
    
    const processedPosts = data.map(post => ({
      ...post,
      featured_image_url: post.featured_image_url ? getImageUrl(post.featured_image_url) : '/images/default-blog.jpg'
    }));
    
    return processedPosts;
  } catch (error) {
    console.error('Error in getBlogPosts:', error);
    return [];
  }
}

// Function to get a single post by slug
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await client.request(
      readItems('blog_content', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'excerpt',
          'date_created',
          'content_html',
          'content_text',
          'category',
          'reading_time',
          'status',
          'meta_title',
          'meta_description',
          'source_url',
          'is_featured'
        ],
        filter: {
          slug: { _eq: slug },
          status: { _eq: 'published' }
        },
        limit: 1
      })
    );

    const post = (response as BlogPost[])?.[0] || null;
    
    // Process image URL on server-side like other content types
    if (post && post.featured_image_url) {
      post.featured_image_url = getImageUrl(post.featured_image_url);
    }
    
    return post;
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }
}

// Function to get related posts
export async function getRelatedPosts(currentSlug: string, category?: string): Promise<BlogPost[]> {
  try {
    const filters: any = {
      slug: { _neq: currentSlug },
      status: { _eq: 'published' }
    };

    if (category) {
      filters.category = { _eq: category };
    }

    const response = await client.request(
      readItems('blog_content', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'excerpt',
          'date_created',
          'category',
          'reading_time'
        ],
        filter: filters,
        limit: 3,
        sort: ['-date_created']
      })
    );

    const posts = (response as BlogPost[]) || [];
    
    // Process image URLs on server-side like other content types
    return posts.map(post => ({
      ...post,
      featured_image_url: post.featured_image_url ? getImageUrl(post.featured_image_url) : '/images/default-blog.jpg'
    }));
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

// ===== BONE JOINT SCHOOL FUNCTIONS =====

// Function to get all bone joint school content
export async function getBoneJointContent(): Promise<EducationalContent[]> {
  try {
    console.log('Attempting to fetch Bone Joint School content from Directus...');
    
    const response = await client.request(
      readItems('educational_content', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'content_html',
          'content_text',
          'content_length',
          'category',
          'educational_category',
          'learning_level',
          'target_audience',
          'parent_slug',
          'date_created',
          'date_updated',
          'status',
          'meta_title',
          'meta_description',
          'source_url',
          'canonical_url'
        ],
        filter: {
          parent_slug: { _eq: 'bone-joint-school' },
          status: { _eq: 'published' }
        },
        sort: ['title'],
        meta: 'total_count'
      })
    );

    console.log('Bone Joint School Directus response:', response);
    return (response as EducationalContent[]) || [];
  } catch (error) {
    console.error('Error fetching bone joint school content:', error);
    return [];
  }
}

// Function to get bone joint content by category
export async function getBoneJointContentByCategory(category: string): Promise<EducationalContent[]> {
  try {
    const filters: any = {
      parent_slug: { _eq: 'bone-joint-school' },
      status: { _eq: 'published' }
    };

    // Add category filter if not 'All'
    if (category && category !== 'All') {
      filters.category = { _eq: category };
    }

    const response = await client.request(
      readItems('educational_content', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'content_html',
          'content_text',
          'content_length',
          'category',
          'educational_category',
          'learning_level',
          'target_audience',
          'parent_slug',
          'date_created',
          'date_updated',
          'status',
          'meta_title',
          'meta_description',
          'source_url',
          'canonical_url'
        ],
        filter: filters,
        sort: ['title']
      })
    );

    return (response as EducationalContent[]) || [];
  } catch (error) {
    console.error('Error fetching bone joint content by category:', error);
    return [];
  }
}

// Function to get a single bone joint content by slug
export async function getBoneJointContentBySlug(slug: string): Promise<EducationalContent | null> {
  try {
    const response = await client.request(
      readItems('educational_content', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'content_html',
          'content_text',
          'content_length',
          'category',
          'educational_category',
          'learning_level',
          'target_audience',
          'parent_slug',
          'date_created',
          'date_updated',
          'status',
          'meta_title',
          'meta_description',
          'source_url',
          'canonical_url'
        ],
        filter: {
          slug: { _eq: slug },
          parent_slug: { _eq: 'bone-joint-school' },
          status: { _eq: 'published' }
        },
        limit: 1
      })
    );

    return (response as EducationalContent[])?.[0] || null;
  } catch (error) {
    console.error('Error fetching bone joint content by slug:', error);
    return null;
  }
}

// Function to get related bone joint content
export async function getRelatedBoneJointContent(currentSlug: string, category?: string): Promise<EducationalContent[]> {
  try {
    const filters: any = {
      slug: { _neq: currentSlug },
      parent_slug: { _eq: 'bone-joint-school' },
      status: { _eq: 'published' }
    };

    if (category) {
      filters.category = { _eq: category };
    }

    const response = await client.request(
      readItems('educational_content', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'content_text',
          'category',
          'date_created'
        ],
        filter: filters,
        limit: 3,
        sort: ['-date_created']
      })
    );

    return (response as EducationalContent[]) || [];
  } catch (error) {
    console.error('Error fetching related bone joint content:', error);
    return [];
  }
}

// Function to get all available categories for bone joint school
export async function getBoneJointCategories(): Promise<string[]> {
  try {
    const response = await client.request(
      readItems('educational_content', {
        fields: ['category'],
        filter: {
          parent_slug: { _eq: 'bone-joint-school' },
          status: { _eq: 'published' },
          category: { _nnull: true }
        },
        meta: 'total_count'
      })
    );

    const content = response as EducationalContent[];
    const categories = Array.from(new Set(content.map(item => item.category).filter(Boolean)));
    
    // Add 'All' at the beginning
    return ['All', ...categories.sort()];
  } catch (error) {
    console.error('Error fetching bone joint categories:', error);
    return ['All'];
  }
}

// ==================== PROCEDURE SURGERY API FUNCTIONS ====================

// Function to get all procedure surgeries with client-side pagination
export async function getProcedureSurgeries(
  limit = 18, 
  offset = 0, 
  category?: string,
  search?: string
): Promise<{
  data: ProcedureSurgery[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    console.log('Fetching ALL procedures from Directus and paginating client-side...');
    
    // Build filters object
    const filters: any = {
      status: { _eq: 'published' },
      parent_slug: { _eq: 'procedure-surgery' }
    };

    if (category && category !== 'All') {
      filters.category = { _eq: category };
    }

    if (search) {
      filters._or = [
        { title: { _icontains: search } },
        { content_text: { _icontains: search } },
        { content_html: { _icontains: search } }
      ];
    }

    console.log('Filters applied:', { category, search });
    
    // Fetch ALL matching procedures (no limit/offset)
    const response = await client.request(
      readItems('medical_procedures', {
        fields: [
          'id',
          'title',
          'slug',
          'content_html',
          'content_text',
          'featured_image_url',
          'category',
          'status',
          'date_created',
          'parent_slug'
        ],
        filter: filters,
        sort: ['-date_created']
        // No limit or offset - get everything
      })
    );
    
    // Handle the response
    const allProcedures = Array.isArray(response) ? response : (response as any) || [];
    
    // Client-side pagination
    const total = allProcedures.length;
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    
    // Get the slice for current page
    const startIndex = offset;
    const endIndex = startIndex + limit;
    const pageData = allProcedures.slice(startIndex, endIndex);

    console.log('Client-side pagination result:', {
      totalProcedures: total,
      currentPage: page,
      totalPages: totalPages,
      showingCount: pageData.length,
      startIndex,
      endIndex
    });

    return {
      data: pageData,
      total: total,
      page: page,
      totalPages: totalPages
    };
  } catch (error) {
    console.error('Error fetching procedure surgeries:', error);
    return {
      data: [],
      total: 0,
      page: 1,
      totalPages: 0
    };
  }
}

// Function to get single procedure by slug
export async function getProcedureSurgeryBySlug(slug: string): Promise<ProcedureSurgery | null> {
  try {
    const response = await client.request(
      readItems('medical_procedures', {
        fields: [
          'id',
          'title',
          'slug',
          'content_html',
          'content_text',
          'content_length',
          'featured_image_url',
          'category',
          'procedure_type',
          'recovery_time',
          'status',
          'meta_title',
          'meta_description',
          'date_created',
          'date_updated',
          'source_url',
          'parent_slug',
          'difficulty_level'
        ],
        filter: {
          slug: { _eq: slug },
          status: { _eq: 'published' },
          parent_slug: { _eq: 'procedure-surgery' }
        },
        limit: 1
      })
    );

    return (response as ProcedureSurgery[])?.[0] || null;
  } catch (error) {
    console.error('Error fetching procedure surgery by slug:', error);
    return null;
  }
}

// Function to get procedure categories with counts
export async function getProcedureCategories(): Promise<string[]> {
  try {
    const response = await client.request(
      readItems('medical_procedures', {
        fields: ['category'],
        filter: {
          status: { _eq: 'published' },
          parent_slug: { _eq: 'procedure-surgery' },
          category: { _nnull: true }
        },
        meta: 'total_count'
      })
    );

    const procedures = response as ProcedureSurgery[];
    const categories = Array.from(new Set(procedures.map(item => item.category).filter((cat): cat is string => Boolean(cat))));
    
    // Add 'All' at the beginning
    return ['All', ...categories.sort()];
  } catch (error) {
    console.error('Error fetching procedure categories:', error);
    return ['All'];
  }
}

// Function to get related procedures
export async function getRelatedProcedures(
  currentId: string, 
  category?: string, 
  limit = 3
): Promise<ProcedureSurgery[]> {
  try {
    const filters: any = {
      id: { _neq: currentId },
      status: { _eq: 'published' },
      parent_slug: { _eq: 'procedure-surgery' }
    };

    if (category) {
      filters.category = { _eq: category };
    }

    const response = await client.request(
      readItems('medical_procedures', {
        fields: [
          'id',
          'title',
          'slug',
          'content_text',
          'featured_image_url',
          'category',
          'recovery_time',
          'date_created'
        ],
        filter: filters,
        limit,
        sort: ['-date_created']
      })
    );

    return (response as ProcedureSurgery[]) || [];
  } catch (error) {
    console.error('Error fetching related procedures:', error);
    return [];
  }
}

// Function to get featured procedures
export async function getFeaturedProcedures(limit = 6): Promise<ProcedureSurgery[]> {
  try {
    const response = await client.request(
      readItems('medical_procedures', {
        fields: [
          'id',
          'title',
          'slug',
          'content_text',
          'featured_image_url',
          'category',
          'recovery_time',
          'date_created'
        ],
        filter: {
          status: { _eq: 'published' },
          parent_slug: { _eq: 'procedure-surgery' }
        },
        limit,
        sort: ['-date_created']
      })
    );

    return (response as ProcedureSurgery[]) || [];
  } catch (error) {
    console.error('Error fetching featured procedures:', error);
    return [];
  }
}

// Function to search procedures
export async function searchProcedures(
  searchTerm: string,
  limit = 10
): Promise<ProcedureSurgery[]> {
  try {
    const response = await client.request(
      readItems('medical_procedures', {
        fields: [
          'id',
          'title',
          'slug',
          'content_text',
          'featured_image_url',
          'category',
          'recovery_time'
        ],
        filter: {
          status: { _eq: 'published' },
          parent_slug: { _eq: 'procedure-surgery' },
          _or: [
            { title: { _icontains: searchTerm } },
            { content_text: { _icontains: searchTerm } },
            { category: { _icontains: searchTerm } },
            { content_html: { _icontains: searchTerm } }
          ]
        },
        limit,
        sort: ['-date_created']
      })
    );

    return (response as ProcedureSurgery[]) || [];
  } catch (error) {
    console.error('Error searching procedures:', error);
    return [];
  }
}

// Debug function to check all medical procedures data
export async function debugMedicalProcedures(): Promise<any> {
  try {
    console.log('\n\n--- Running Medical Procedure Debug ---');
    const response: any = await client.request(
      readItems('medical_procedures', {
        fields: ['id', 'title', 'status', 'parent_slug'],
        limit: -1 // Fetch all items
      })
    );
    
    const items = Array.isArray(response) ? response : response.data;
    console.log(`Found a total of ${items.length} records in 'medical_procedures' collection.`);

    const statusDistribution: Record<string, number> = {};
    const parentSlugDistribution: Record<string, number> = {};

    for (const item of items) {
      const status = item.status || 'not_set';
      const parentSlug = item.parent_slug || 'not_set';
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
      parentSlugDistribution[parentSlug] = (parentSlugDistribution[parentSlug] || 0) + 1;
    }

    console.log('Status Distribution:', statusDistribution);
    console.log('Parent Slug Distribution:', parentSlugDistribution);

    const filteredCount = items.filter((item: any) => item.status === 'published' && item.parent_slug === 'procedure-surgery').length;
    console.log(`Count matching { status: 'published', parent_slug: 'procedure-surgery' }: ${filteredCount}`);
    console.log('--- End Medical Procedure Debug ---\n\n');

  } catch (e) {
    console.error('Error in debugMedicalProcedures:', e);
  }
}

// Debug function to check gallery data
export async function debugGalleryData(): Promise<any> {
  try {
    console.log('\n\n--- Running Gallery Debug ---');
    const response: any = await client.request(
      readItems('gallery', {
        fields: ['id', 'title', 'category', 'image', 'alt_text', 'date_created'],
        limit: -1 // Fetch all items
      })
    );
    
    const items = Array.isArray(response) ? response : response.data;
    console.log(`Found a total of ${items?.length || 0} records in 'gallery' collection.`);

    if (items && items.length > 0) {
      console.log('Sample gallery item:', items[0]);
      console.log('Available fields:', Object.keys(items[0]));
    }

    console.log('--- End Gallery Debug ---\n\n');
    return { items, count: items?.length || 0 };

  } catch (e) {
    console.error('Error in debugGalleryData:', e);
    return { items: [], count: 0 };
  }
}

// getImageUrl function is already exported above (line 91)

// ========== GALLERY API FUNCTIONS ==========

// Function to get all gallery images with pagination and filtering
export async function getGalleryImages(
  limit = -1, // Get ALL items by default
  offset = 0,
  category?: string,
  search?: string
): Promise<{
  data: GalleryImage[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    console.log('Fetching gallery images from Directus...');
    
    // First, let's debug the data
    await debugGalleryData();
    
    const filters: any = {};

    if (category && category !== 'All') {
      filters.category = { _eq: category };
    }

    if (search) {
      filters._or = [
        { title: { _icontains: search } },
        { alt_text: { _icontains: search } },
        { category: { _icontains: search } }
      ];
    }

    const queryParams: any = {
      fields: [
        'id',
        'title',
        'category',
        'image',
        'alt_text',
        'date_created'
      ],
      sort: ['-date_created'],
      meta: 'total_count'
    };

    // Only add limit/offset if not getting all items
    if (limit > 0) {
      queryParams.limit = limit;
      queryParams.offset = offset;
    }

    // Only add filter if we have filters
    if (Object.keys(filters).length > 0) {
      queryParams.filter = filters;
    }

    const response = await client.request(readItems('gallery', queryParams));

    const items = Array.isArray(response) ? response : (response as any).data || [];
    const meta = Array.isArray(response) ? null : (response as any).meta;
    const total = meta?.total_count || items.length;

    console.log(`Gallery API: Found ${items.length} items, total: ${total}`);

    return {
      data: items as GalleryImage[],
      total,
      page: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1
    };
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return {
      data: [],
      total: 0,
      page: 1,
      totalPages: 0
    };
  }
}

// Function to get gallery image by ID
export async function getGalleryImageById(id: string): Promise<GalleryImage | null> {
  try {
    const response = await client.request(
      readItems('gallery', {
        fields: [
          'id',
          'title',
          'category',
          'image',
          'alt_text',
          'date_created'
        ],
        filter: {
          id: { _eq: id }
        },
        limit: 1
      })
    );

    return (response as GalleryImage[])?.[0] || null;
  } catch (error) {
    console.error('Error fetching gallery image by ID:', error);
    return null;
  }
}

// Function to get gallery categories with counts
export async function getGalleryCategories(): Promise<string[]> {
  try {
    const response = await client.request(
      readItems('gallery', {
        fields: ['category'],
        filter: {
          category: { _nnull: true }
        },
        meta: 'total_count'
      })
    );

    const images = response as GalleryImage[];
    const categories = Array.from(new Set(images.map(item => item.category).filter((cat): cat is string => Boolean(cat))));
    
    // Add 'All' at the beginning
    return ['All', ...categories.sort()];
  } catch (error) {
    console.error('Error fetching gallery categories:', error);
    return ['All'];
  }
}

// Function to get related gallery images
export async function getRelatedGalleryImages(
  currentId: string,
  category?: string,
  limit = 4
): Promise<GalleryImage[]> {
  try {
    const filters: any = {
      id: { _neq: currentId }
    };

    if (category) {
      filters.category = { _eq: category };
    }

    const response = await client.request(
      readItems('gallery', {
        fields: [
          'id',
          'title',
          'category',
          'image',
          'alt_text',
          'date_created'
        ],
        filter: filters,
        limit,
        sort: ['-date_created']
      })
    );

    return (response as GalleryImage[]) || [];
  } catch (error) {
    console.error('Error fetching related gallery images:', error);
    return [];
  }
}

// Function to search gallery images
export async function searchGalleryImages(
  searchTerm: string,
  limit = 10
): Promise<GalleryImage[]> {
  try {
    const response = await client.request(
      readItems('gallery', {
        fields: [
          'id',
          'title',
          'category',
          'image',
          'alt_text',
          'date_created'
        ],
        filter: {
          _or: [
            { title: { _icontains: searchTerm } },
            { alt_text: { _icontains: searchTerm } },
            { category: { _icontains: searchTerm } }
          ]
        },
        limit,
        sort: ['-date_created']
      })
    );

    return (response as GalleryImage[]) || [];
  } catch (error) {
    console.error('Error searching gallery images:', error);
    return [];
  }
}

// ========== CLINICAL VIDEOS API FUNCTIONS ==========

// Function to get all clinical videos with pagination and filtering
// Debug function to check clinical videos data
export async function debugClinicalVideosData(): Promise<any> {
  try {
    console.log('\n\n--- Running Clinical Videos Debug ---');
    const response: any = await client.request(
      readItems('clinical_videos', {
        fields: ['id', 'title', 'category', 'video_id', 'youtube_url', 'date_created'],
        limit: -1 // Fetch all items
      })
    );
    
    const items = Array.isArray(response) ? response : response.data;
    console.log(`Found a total of ${items?.length || 0} records in 'clinical_videos' collection.`);

    if (items && items.length > 0) {
      console.log('Sample clinical video item:', items[0]);
      console.log('Available fields:', Object.keys(items[0]));
    }

    console.log('--- End Clinical Videos Debug ---\n\n');
    return { items, count: items?.length || 0 };

  } catch (e) {
    console.error('Error in debugClinicalVideosData:', e);
    return { items: [], count: 0 };
  }
}

export async function getClinicalVideos(
  limit = -1, // Get ALL items by default
  offset = 0,
  category?: string,
  search?: string
): Promise<{
  data: ClinicalVideo[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    console.log('Fetching clinical videos from Directus...');
    
    // First, let's debug the data
    await debugClinicalVideosData();
    
    const filters: any = {};

    if (category && category !== 'All') {
      filters.category = { _eq: category };
    }

    if (search) {
      filters._or = [
        { title: { _icontains: search } },
        { description: { _icontains: search } },
        { category: { _icontains: search } }
      ];
    }

    const queryParams: any = {
      fields: [
        'id',
        'title',
        'category',
        'video_id',
        'youtube_url',
        'thumbnail_url',
        'description',
        'duration',
        'date_created'
      ],
      sort: ['-date_created'],
      meta: 'total_count'
    };

    // Only add limit/offset if not getting all items
    if (limit > 0) {
      queryParams.limit = limit;
      queryParams.offset = offset;
    }

    // Only add filter if we have filters
    if (Object.keys(filters).length > 0) {
      queryParams.filter = filters;
    }

    const response = await client.request(readItems('clinical_videos', queryParams));

    const items = Array.isArray(response) ? response : (response as any).data || [];
    const meta = Array.isArray(response) ? null : (response as any).meta;
    const total = meta?.total_count || items.length;

    console.log(`Clinical Videos API: Found ${items.length} items, total: ${total}`);
    if (items.length > 0) {
      console.log('Sample video item with thumbnail:', {
        id: items[0].id,
        title: items[0].title,
        video_id: items[0].video_id,
        thumbnail_url: items[0].thumbnail_url
      });
    }

    return {
      data: items as ClinicalVideo[],
      total,
      page: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1
    };
  } catch (error) {
    console.error('Error fetching clinical videos:', error);
    return {
      data: [],
      total: 0,
      page: 1,
      totalPages: 0
    };
  }
}

// Function to get clinical video by ID
export async function getClinicalVideoById(id: string): Promise<ClinicalVideo | null> {
  try {
    const response = await client.request(
      readItems('clinical_videos', {
        fields: [
          'id',
          'title',
          'category',
          'video_id',
          'youtube_url',
          'thumbnail_url',
          'description',
          'duration',
          'date_created'
        ],
        filter: {
          id: { _eq: id }
        },
        limit: 1
      })
    );

    return (response as ClinicalVideo[])?.[0] || null;
  } catch (error) {
    console.error('Error fetching clinical video by ID:', error);
    return null;
  }
}

// Function to get video categories with counts
export async function getVideoCategories(): Promise<string[]> {
  try {
    const response = await client.request(
      readItems('clinical_videos', {
        fields: ['category'],
        filter: {
          category: { _nnull: true }
        },
        meta: 'total_count'
      })
    );

    const videos = response as ClinicalVideo[];
    const categories = Array.from(new Set(videos.map(item => item.category).filter((cat): cat is string => Boolean(cat))));
    
    // Add 'All' at the beginning
    return ['All', ...categories.sort()];
  } catch (error) {
    console.error('Error fetching video categories:', error);
    return ['All'];
  }
}

// Function to get related clinical videos
export async function getRelatedClinicalVideos(
  currentId: string,
  category?: string,
  limit = 4
): Promise<ClinicalVideo[]> {
  try {
    const filters: any = {
      id: { _neq: currentId }
    };

    if (category) {
      filters.category = { _eq: category };
    }

    const response = await client.request(
      readItems('clinical_videos', {
        fields: [
          'id',
          'title',
          'category',
          'video_id',
          'youtube_url',
          'thumbnail_url',
          'description',
          'date_created'
        ],
        filter: filters,
        limit,
        sort: ['-date_created']
      })
    );

    return (response as ClinicalVideo[]) || [];
  } catch (error) {
    console.error('Error fetching related clinical videos:', error);
    return [];
  }
}

// Function to get featured clinical videos
export async function getFeaturedClinicalVideos(limit = 6): Promise<ClinicalVideo[]> {
  try {
    const response = await client.request(
      readItems('clinical_videos', {
        fields: [
          'id',
          'title',
          'category',
          'video_id',
          'youtube_url',
          'thumbnail_url',
          'description',
          'date_created'
        ],
        limit,
        sort: ['-date_created']
      })
    );

    return (response as ClinicalVideo[]) || [];
  } catch (error) {
    console.error('Error fetching featured clinical videos:', error);
    return [];
  }
}

// Function to search clinical videos
export async function searchClinicalVideos(
  searchTerm: string,
  limit = 10
): Promise<ClinicalVideo[]> {
  try {
    const response = await client.request(
      readItems('clinical_videos', {
        fields: [
          'id',
          'title',
          'category',
          'video_id',
          'youtube_url',
          'thumbnail_url',
          'description',
          'date_created'
        ],
        filter: {
          _or: [
            { title: { _icontains: searchTerm } },
            { description: { _icontains: searchTerm } },
            { category: { _icontains: searchTerm } }
          ]
        },
        limit,
        sort: ['-date_created']
      })
    );

    return (response as ClinicalVideo[]) || [];
  } catch (error) {
    console.error('Error searching clinical videos:', error);
    return [];
  }
}

// =====================================
// STAFF INFO FUNCTIONS
// =====================================

// Function to get all staff members with pagination and filtering
export async function getStaffMembers(
  limit = 12, 
  offset = 0, 
  category?: string,
  search?: string
): Promise<{
  data: StaffMember[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    const filters: any = {
      status: { _eq: 'published' }
    };

    // Add category filter if provided and not "All"
    if (category && category !== 'All') {
      filters.category = { _eq: category };
    }

    // Add search filter if provided
    if (search) {
      filters._or = [
        { title: { _icontains: search } },
        { content_text: { _icontains: search } },
        { excerpt: { _icontains: search } },
        { category: { _icontains: search } }
      ];
    }

    const queryParams: any = {
      fields: [
        'id',
        'title',
        'slug',
        'status',
        'meta_title',
        'meta_description',
        'canonical_url',
        'featured_image_url',
        'content_html',
        'content_text',
        'content_length',
        'date_created',
        'date_updated',
        'source_url',
        'parent_slug',
        'category',
        'excerpt',
        'reading_time',
        'is_featured'
      ],
      sort: ['-is_featured', '-date_created'],
      meta: 'total_count'
    };

    // Add pagination if limit is specified
    if (limit > 0) {
      queryParams.limit = limit;
      queryParams.offset = offset;
    }

    // Only add filter if we have filters
    if (Object.keys(filters).length > 0) {
      queryParams.filter = filters;
    }

    const response = await client.request(readItems('staff_info', queryParams));

    const items = Array.isArray(response) ? response : (response as any).data || [];
    const meta = Array.isArray(response) ? null : (response as any).meta;
    const total = meta?.total_count || items.length;

    console.log(`Staff API: Found ${items.length} items, total: ${total}`);

    // Process image URLs
    const processedItems = (items as StaffMember[]).map(item => ({
      ...item,
      featured_image_url: item.featured_image_url ? getImageUrl(item.featured_image_url) : undefined
    }));

    return {
      data: processedItems,
      total,
      page: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1
    };
  } catch (error) {
    console.error('Error fetching staff members:', error);
    return {
      data: [],
      total: 0,
      page: 1,
      totalPages: 0
    };
  }
}

// Function to get staff member by slug
export async function getStaffMemberBySlug(slug: string): Promise<StaffMember | null> {
  try {
    const response = await client.request(
      readItems('staff_info', {
        fields: [
          'id',
          'title',
          'slug',
          'status',
          'meta_title',
          'meta_description',
          'canonical_url',
          'featured_image_url',
          'content_html',
          'content_text',
          'content_length',
          'date_created',
          'date_updated',
          'source_url',
          'parent_slug',
          'category',
          'excerpt',
          'reading_time',
          'is_featured'
        ],
        filter: {
          slug: { _eq: slug },
          status: { _eq: 'published' }
        },
        limit: 1
      })
    );

    const staff = (response as StaffMember[])?.[0] || null;
    if (staff && staff.featured_image_url) {
      staff.featured_image_url = getImageUrl(staff.featured_image_url);
    }
    return staff;
  } catch (error) {
    console.error('Error fetching staff member by slug:', error);
    return null;
  }
}

// Function to get staff categories with counts
export async function getStaffCategories(): Promise<string[]> {
  try {
    const response = await client.request(
      readItems('staff_info', {
        fields: ['category'],
        filter: {
          category: { _nnull: true },
          status: { _eq: 'published' }
        },
        meta: 'total_count'
      })
    );

    const staff = response as StaffMember[];
    const categories = Array.from(new Set(staff.map(item => item.category).filter((cat): cat is string => Boolean(cat))));
    
    // Add 'All' at the beginning
    return ['All', ...categories.sort()];
  } catch (error) {
    console.error('Error fetching staff categories:', error);
    return ['All'];
  }
}

// Function to search staff members
export async function searchStaffMembers(
  searchTerm: string,
  limit = 10
): Promise<StaffMember[]> {
  try {
    const response = await client.request(
      readItems('staff_info', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'excerpt',
          'category',
          'date_created',
          'is_featured'
        ],
        filter: {
          status: { _eq: 'published' },
          _or: [
            { title: { _icontains: searchTerm } },
            { content_text: { _icontains: searchTerm } },
            { excerpt: { _icontains: searchTerm } },
            { category: { _icontains: searchTerm } }
          ]
        },
        limit,
        sort: ['-is_featured', '-date_created']
      })
    );

    const staff = (response as StaffMember[]) || [];
    // Process image URLs
    return staff.map(item => ({
      ...item,
      featured_image_url: item.featured_image_url ? getImageUrl(item.featured_image_url) : undefined
    }));
  } catch (error) {
    console.error('Error searching staff members:', error);
    return [];
  }
}

// Function to get related staff members
export async function getRelatedStaffMembers(
  currentId: string,
  category?: string,
  limit = 3
): Promise<StaffMember[]> {
  try {
    const filters: any = {
      id: { _neq: currentId },
      status: { _eq: 'published' }
    };

    if (category) {
      filters.category = { _eq: category };
    }

    const response = await client.request(
      readItems('staff_info', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'excerpt',
          'category',
          'date_created',
          'is_featured'
        ],
        filter: filters,
        limit,
        sort: ['-is_featured', '-date_created']
      })
    );

    const staff = (response as StaffMember[]) || [];
    // Process image URLs
    return staff.map(item => ({
      ...item,
      featured_image_url: item.featured_image_url ? getImageUrl(item.featured_image_url) : undefined
    }));
  } catch (error) {
    console.error('Error fetching related staff members:', error);
    return [];
  }
}

// Function to get featured staff members
export async function getFeaturedStaffMembers(limit = 6): Promise<StaffMember[]> {
  try {
    const response = await client.request(
      readItems('staff_info', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'excerpt',
          'category',
          'date_created',
          'is_featured'
        ],
        filter: {
          status: { _eq: 'published' },
          is_featured: { _eq: true }
        },
        limit,
        sort: ['-date_created']
      })
    );

    // If we don't have enough featured staff, get regular staff sorted by date
    const rawFeaturedStaff = (response as StaffMember[]) || [];
    // Process image URLs for featured staff
    const featuredStaff = rawFeaturedStaff.map(item => ({
      ...item,
      featured_image_url: item.featured_image_url ? getImageUrl(item.featured_image_url) : undefined
    }));
    
    if (featuredStaff.length < limit) {
      const additionalResponse = await client.request(
        readItems('staff_info', {
          fields: [
            'id',
            'title',
            'slug',
            'featured_image_url',
            'excerpt',
            'category',
            'date_created',
            'is_featured'
          ],
          filter: {
            status: { _eq: 'published' },
            is_featured: { _neq: true }
          },
          limit: limit - featuredStaff.length,
          sort: ['-date_created']
        })
      );

      const additionalStaff = (additionalResponse as StaffMember[]) || [];
      // Process image URLs for additional staff
      const processedAdditional = additionalStaff.map(item => ({
        ...item,
        featured_image_url: item.featured_image_url ? getImageUrl(item.featured_image_url) : undefined
      }));
      return [...featuredStaff, ...processedAdditional];
    }

    return featuredStaff;
  } catch (error) {
    console.error('Error fetching featured staff members:', error);
    return [];
  }
}

// Debug function for staff data
export async function debugStaffData(): Promise<any> {
  try {
    console.log('=== DEBUGGING STAFF DATA ===');
    
    const response = await client.request(
      readItems('staff_info', {
        meta: 'total_count',
        limit: 5
      })
    );

    console.log('Staff debug response:', response);
    return response;
  } catch (error) {
    console.error('Debug staff data error:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ===== PUBLICATIONS FUNCTIONS =====

// Function to get all publications with client-side pagination
export async function getPublications(
  limit = 12, 
  offset = 0, 
  category?: string,
  search?: string,
  publication_type?: string
): Promise<{
  data: Publication[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    const activeClient = client || createPublicClient();
    if (!activeClient) {
      console.error('Failed to create Directus client');
      return {
        data: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
    }

    const response = await activeClient.request(
      readItems('publications', {
        fields: [
          'id',
          'title',
          'slug',
          'authors',
          'publication_date',
          'publication_type',
          'category',
          'featured_image_url',
          'source_url',
          'status',
          'date_created'
        ]
      })
    );

    const data = handleDirectusResponse<Publication>(response);
    const total = data.length;
    
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    // Apply client-side pagination
    const startIndex = offset;
    const endIndex = startIndex + limit;
    const paginatedData = data.slice(startIndex, endIndex);
    
    // Process image URLs
    const processedData = paginatedData.map(publication => ({
      ...publication,
      featured_image_url: publication.featured_image_url ? getImageUrl(publication.featured_image_url) : undefined
    }));

    return {
      data: processedData,
      total,
      page,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching publications:', error);
    return {
      data: [],
      total: 0,
      page: 1,
      totalPages: 0
    };
  }
}

// Function to get a single publication by slug
export async function getPublicationBySlug(slug: string): Promise<Publication | null> {
  try {
    const response = await client.request(
      readItems('publications', {
        fields: [
          'id',
          'title',
          'slug',
          'status',
          'content_html',
          'content_text',
          'content_length',
          'featured_image_url',
          'authors',
          'publication_date',
          'publication_type',
          'category',
          'meta_title',
          'meta_description',
          'canonical_url',
          'source_url',
          'parent_slug',
          'date_created',
          'date_updated'
        ],
        filter: {
          slug: { _eq: slug },
          status: { _eq: 'published' }
        },
        limit: 1
      })
    );

    const publication = (response as Publication[])?.[0] || null;
    
    // Process image URL on server-side like other content types
    if (publication && publication.featured_image_url) {
      publication.featured_image_url = getImageUrl(publication.featured_image_url);
    }
    
    return publication;
  } catch (error) {
    console.error('Error fetching publication by slug:', error);
    return null;
  }
}

// Function to get publication categories
export async function getPublicationCategories(): Promise<string[]> {
  try {
    const response = await client.request(
      readItems('publications', {
        fields: ['category'],
        filter: {
          category: { _nnull: true },
          status: { _eq: 'published' }
        },
        meta: 'total_count'
      })
    );

    const publications = response as Publication[];
    const categories = Array.from(new Set(publications.map(item => item.category).filter((cat): cat is string => Boolean(cat))));
    
    // Add 'All' at the beginning
    return ['All', ...categories.sort()];
  } catch (error) {
    console.error('Error fetching publication categories:', error);
    return ['All'];
  }
}

// Function to get publication types
export async function getPublicationTypes(): Promise<string[]> {
  try {
    const response = await client.request(
      readItems('publications', {
        fields: ['publication_type'],
        filter: {
          publication_type: { _nnull: true },
          status: { _eq: 'published' }
        },
        meta: 'total_count'
      })
    );

    const publications = response as Publication[];
    const types = Array.from(new Set(publications.map(item => item.publication_type).filter((type): type is string => Boolean(type))));
    
    // Add 'All' at the beginning
    return ['All', ...types.sort()];
  } catch (error) {
    console.error('Error fetching publication types:', error);
    return ['All'];
  }
}

// Function to search publications
export async function searchPublications(
  searchTerm: string,
  limit = 10
): Promise<Publication[]> {
  try {
    const response = await client.request(
      readItems('publications', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'authors',
          'publication_date',
          'publication_type',
          'category',
          'date_created'
        ],
        filter: {
          status: { _eq: 'published' },
          _or: [
            { title: { _icontains: searchTerm } },
            { content_text: { _icontains: searchTerm } },
            { authors: { _icontains: searchTerm } },
            { category: { _icontains: searchTerm } }
          ]
        },
        limit,
        sort: ['-publication_date', '-date_created']
      })
    );

    const publications = (response as Publication[]) || [];
    // Process image URLs
    return publications.map(publication => ({
      ...publication,
      featured_image_url: publication.featured_image_url ? getImageUrl(publication.featured_image_url) : undefined
    }));
  } catch (error) {
    console.error('Error searching publications:', error);
    return [];
  }
}

// Function to get related publications
export async function getRelatedPublications(
  currentId: string,
  category?: string,
  limit = 3
): Promise<Publication[]> {
  try {
    const filters: any = {
      id: { _neq: currentId },
      status: { _eq: 'published' }
    };

    if (category) {
      filters.category = { _eq: category };
    }

    const response = await client.request(
      readItems('publications', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'authors',
          'publication_date',
          'publication_type',
          'category',
          'date_created'
        ],
        filter: filters,
        limit,
        sort: ['-publication_date', '-date_created']
      })
    );

    const publications = (response as Publication[]) || [];
    // Process image URLs
    return publications.map(publication => ({
      ...publication,
      featured_image_url: publication.featured_image_url ? getImageUrl(publication.featured_image_url) : undefined
    }));
  } catch (error) {
    console.error('Error fetching related publications:', error);
    return [];
  }
}

// Function to get featured publications
export async function getFeaturedPublications(limit = 6): Promise<Publication[]> {
  try {
    const response = await client.request(
      readItems('publications', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'authors',
          'publication_date',
          'publication_type',
          'category',
          'date_created'
        ],
        filter: {
          status: { _eq: 'published' }
        },
        limit,
        sort: ['-publication_date', '-date_created']
      })
    );

    const publications = (response as Publication[]) || [];
    // Process image URLs
    return publications.map(publication => ({
      ...publication,
      featured_image_url: publication.featured_image_url ? getImageUrl(publication.featured_image_url) : undefined
    }));
  } catch (error) {
    console.error('Error fetching featured publications:', error);
    return [];
  }
}

// Debug function for publications data
export async function debugPublicationsData(): Promise<any> {
  try {
    console.log('=== DEBUGGING PUBLICATIONS DATA ===');
    
    const response = await client.request(
      readItems('publications', {
        meta: 'total_count',
        limit: 5
      })
    );

    console.log('Publications debug response:', response);
    return response;
  } catch (error) {
    console.error('Debug publications data error:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Function to get all landing pages
export async function getLandingPages(): Promise<LandingPage[]> {
  try {
    const activeClient = client || createPublicClient();
    if (!activeClient) {
      console.error('Failed to create Directus client');
      return [];
    }
    
    const response = await activeClient.request(
      readItems('landing_pages', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'content_html',
          'content_text',
          'content_length',
          'category',
          'location',
          'service_focus',
          'date_created',
          'date_updated',
          'status',
          'meta_title',
          'meta_description',
          'canonical_url',
          'source_url',
          'parent_slug'
        ],
        filter: {
          status: {
            _eq: 'published'
          }
        }
      })
    );

    return handleDirectusResponse<LandingPage>(response);
  } catch (error) {
    console.error('Error fetching landing pages:', error);
    return [];
  }
}

// Function to get a landing page by slug
export async function getLandingPageBySlug(slug: string): Promise<LandingPage | null> {
  try {
    const activeClient = client || createPublicClient();
    if (!activeClient) {
      console.error('Failed to create Directus client');
      return null;
    }
    
    const response = await activeClient.request(
      readItems('landing_pages', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'content_html',
          'content_text',
          'content_length',
          'category',
          'location',
          'service_focus',
          'date_created',
          'date_updated',
          'status',
          'meta_title',
          'meta_description',
          'canonical_url',
          'source_url',
          'parent_slug'
        ],
        filter: {
          slug: {
            _eq: slug
          },
          status: {
            _eq: 'published'
          }
        }
      })
    );

    const items = handleDirectusResponse<LandingPage>(response);
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    console.error('Error fetching landing page by slug:', error);
    return null;
  }
}

// Function to get homepage content (root landing page)
export async function getHomepageContent(): Promise<{
  heroContent: LandingPage | null;
  specialties: EducationalContent[];
  featuredProcedures: ProcedureSurgery[];
  featuredPosts: BlogPost[];
  staffMembers: StaffMember[];
  clinicalVideos: ClinicalVideo[];
}> {
  try {
    const [
      heroContent,
      specialties,
      featuredProcedures,
      featuredPosts,
      staffMembers,
      clinicalVideos
    ] = await Promise.all([
      getLandingPageBySlug('homepage') || getLandingPages().then(pages => pages[0] || null),
      getBoneJointContent(),
      getFeaturedProcedures(6),
      getBlogPosts(),
      getFeaturedStaffMembers(3),
      getFeaturedClinicalVideos(4)
    ]);

    return {
      heroContent,
      specialties: specialties.slice(0, 6), // Get first 6 specialties
      featuredProcedures: featuredProcedures.slice(0, 6),
      featuredPosts: featuredPosts.slice(0, 3),
      staffMembers: staffMembers.slice(0, 3),
      clinicalVideos: clinicalVideos.slice(0, 4)
    };
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    return {
      heroContent: null,
      specialties: [],
      featuredProcedures: [],
      featuredPosts: [],
      staffMembers: [],
      clinicalVideos: []
    };
  }
} 