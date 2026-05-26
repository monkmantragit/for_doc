'use server';

import {
  searchProcedures,
  searchPublications,
  searchClinicalVideos,
  searchStaffMembers,
  getBoneJointContent,
  getBlogPosts,
} from '@/lib/directus';

export type SearchResultKind =
  | 'procedure'
  | 'condition'
  | 'blog'
  | 'surgeon'
  | 'publication'
  | 'video'
  | 'page';

export interface SearchResult {
  kind: SearchResultKind;
  title: string;
  url: string;
  excerpt?: string;
  category?: string;
}

export interface SearchResultGroup {
  kind: SearchResultKind;
  label: string;
  viewAllUrl?: string;
  results: SearchResult[];
}

export interface SearchResponse {
  query: string;
  totalCount: number;
  groups: SearchResultGroup[];
}

const PER_GROUP_LIMIT = 8;

// Static / hand-curated routes that aren't in the CMS.
// Edit this list when you add a new top-level marketing route.
const STATIC_PAGES: { title: string; url: string; description: string; keywords?: string[] }[] = [
  { title: 'Home', url: '/', description: 'Sports Orthopedics Institute homepage.' },
  { title: 'Contact', url: '/contact', description: 'Contact details, location and enquiry form.' },
  { title: 'Surgeons & Staff', url: '/surgeons-staff', description: 'Meet our orthopedic surgeons and clinical team.' },
  { title: 'Sports Rehabilitation', url: '/physiotherapy', description: 'Physiotherapy and sports rehabilitation services.', keywords: ['physio', 'rehab'] },
  { title: 'Clinical Videos', url: '/clinical-videos', description: 'Educational and procedure videos from our team.' },
  { title: 'Publications', url: '/publications', description: 'Research papers and publications by our consultants.' },
  { title: 'Blogs', url: '/blogs', description: 'Articles and insights on orthopedic care.' },
  { title: 'Gallery', url: '/gallery', description: 'Photos of our facility and team.' },
  { title: 'Fellowship Programme', url: '/fellowship-programme', description: 'Orthopedic fellowship training opportunities.' },
  { title: 'Book an Appointment', url: '/book-appointment', description: 'Schedule a consultation with our orthopedic team.', keywords: ['appointment', 'booking', 'consultation'] },
  { title: 'Bone Joint School', url: '/bone-joint-school', description: 'Patient education on bone and joint conditions.' },
  { title: 'All Procedures', url: '/procedure-surgery', description: 'Browse all orthopedic procedures and surgeries we perform.' },
  // (static) route-group pages
  { title: 'ACL Reconstruction and Meniscus Repair', url: '/acl-reconstruction-and-meniscus-repair', description: 'Combined ACL reconstruction and meniscus repair.' },
  { title: 'ACL Reconstruction Surgery in Bangalore', url: '/acl-reconstruction-surgery-in-bangalore', description: 'ACL reconstruction surgery in Bangalore.' },
  { title: 'ACL Tear Laser Therapy', url: '/acl-tear-laser-therapy', description: 'Laser therapy options for ACL tears.' },
  { title: 'Appointment Booking Info', url: '/appointment-booking-info', description: 'How appointment booking works.' },
  { title: 'Arthroscopic Debridement Guide', url: '/arthroscopic-debridement-guide-procedure-and-recovery', description: 'Procedure and recovery guide for arthroscopic debridement.' },
  { title: 'Meniscus Tear Exercises to Avoid', url: '/meniscus-tear-exercises-to-avoid', description: 'Exercises to avoid with a meniscus tear.' },
  { title: 'Robotic Knee Replacement Surgeon in Bangalore', url: '/robotic-knee-replacement-surgeon-in-bangalore', description: 'Robotic knee replacement surgery in Bangalore.' },
  { title: 'Stages of Avascular Necrosis', url: '/stages-of-avascular-necrosis-symptoms-and-treatments', description: 'Symptoms and treatments across AVN stages.' },
  { title: 'Total Hip Replacement in Bangalore', url: '/total-hip-replacement-in-bangalore', description: 'Total hip replacement surgery in Bangalore.' },
  { title: 'Total Knee Replacement in Bangalore', url: '/total-knee-replacement-in-bangalore', description: 'Total knee replacement surgery in Bangalore.' },
];

function buildExcerpt(text: string | undefined | null, query: string, max = 180): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return undefined;
  const idx = clean.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
  const start = Math.max(0, idx - 60);
  const end = Math.min(clean.length, idx + query.length + 100);
  const slice = clean.slice(start, end);
  return (start > 0 ? '…' : '') + slice + (end < clean.length ? '…' : '');
}

function matchStaticPages(query: string): SearchResult[] {
  const q = query.toLowerCase();
  return STATIC_PAGES.filter((p) => {
    const haystack = [p.title, p.description, ...(p.keywords ?? [])].join(' ').toLowerCase();
    return haystack.includes(q);
  }).map((p) => ({
    kind: 'page' as const,
    title: p.title,
    url: p.url,
    excerpt: p.description,
  }));
}

export async function searchSite(rawQuery: string): Promise<SearchResponse> {
  const query = (rawQuery ?? '').trim();
  if (query.length < 2) {
    return { query, totalCount: 0, groups: [] };
  }

  const [
    procedures,
    publications,
    videos,
    surgeons,
    boneJoint,
    blogs,
  ] = await Promise.all([
    searchProcedures(query, PER_GROUP_LIMIT).catch(() => []),
    searchPublications(query, PER_GROUP_LIMIT).catch(() => []),
    searchClinicalVideos(query, PER_GROUP_LIMIT).catch(() => []),
    searchStaffMembers(query, PER_GROUP_LIMIT).catch(() => []),
    getBoneJointContent().catch(() => []),
    getBlogPosts().catch(() => []),
  ]);

  const q = query.toLowerCase();

  const procedureResults: SearchResult[] = procedures.map((p: any) => ({
    kind: 'procedure',
    title: p.title,
    url: `/procedure-surgery/${p.slug}`,
    excerpt: buildExcerpt(p.content_text, query),
    category: p.category,
  }));

  const publicationResults: SearchResult[] = publications.map((p: any) => ({
    kind: 'publication',
    title: p.title,
    url: `/publications/${p.slug}`,
    excerpt: p.authors ? `By ${p.authors}` : undefined,
    category: p.category,
  }));

  const videoResults: SearchResult[] = videos.map((v: any) => ({
    kind: 'video',
    title: v.title,
    url: `/clinical-videos`,
    excerpt: buildExcerpt(v.description, query),
    category: v.category,
  }));

  const surgeonResults: SearchResult[] = surgeons.map((s: any) => ({
    kind: 'surgeon',
    title: s.title,
    url: `/surgeons-staff/${s.slug}`,
    excerpt: s.excerpt,
    category: s.category,
  }));

  const conditionResults: SearchResult[] = boneJoint
    .filter((c: any) => {
      const hay = [c.title, c.content_text, c.category, c.meta_description].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    })
    .slice(0, PER_GROUP_LIMIT)
    .map((c: any) => ({
      kind: 'condition',
      title: c.title,
      url: `/bone-joint-school/${c.slug}`,
      excerpt: buildExcerpt(c.content_text || c.meta_description, query),
      category: c.category,
    }));

  const blogResults: SearchResult[] = blogs
    .filter((b: any) => {
      const hay = [b.title, b.excerpt, b.content_text, b.category, b.meta_description].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    })
    .slice(0, PER_GROUP_LIMIT)
    .map((b: any) => ({
      kind: 'blog',
      title: b.title,
      url: `/blogs/${b.slug}`,
      excerpt: buildExcerpt(b.excerpt || b.content_text, query),
      category: b.category,
    }));

  const pageResults = matchStaticPages(query).slice(0, PER_GROUP_LIMIT);

  const groups: SearchResultGroup[] = [
    { kind: 'procedure', label: 'Procedures', viewAllUrl: '/procedure-surgery', results: procedureResults },
    { kind: 'condition', label: 'Bone & Joint School', viewAllUrl: '/bone-joint-school', results: conditionResults },
    { kind: 'surgeon', label: 'Surgeons & Staff', viewAllUrl: '/surgeons-staff', results: surgeonResults },
    { kind: 'blog', label: 'Blogs', viewAllUrl: '/blogs', results: blogResults },
    { kind: 'publication', label: 'Publications', viewAllUrl: '/publications', results: publicationResults },
    { kind: 'video', label: 'Clinical Videos', viewAllUrl: '/clinical-videos', results: videoResults },
    { kind: 'page', label: 'Pages', results: pageResults },
  ].filter((g) => g.results.length > 0);

  const totalCount = groups.reduce((sum, g) => sum + g.results.length, 0);

  return { query, totalCount, groups };
}
