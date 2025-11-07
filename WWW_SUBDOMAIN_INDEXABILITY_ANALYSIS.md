# WWW Subdomain Indexability Issue - Analysis & Recommendations

**Date:** November 7, 2025  
**Site:** sportsorthopedics.in  
**Issue:** All www versions of pages are non-indexable and canonicalized

---

## Executive Summary

All pages on the www subdomain (https://www.sportsorthopedics.in/*) are showing as "Non-Indexable" in search console. The root cause is that the site's `metadataBase` configuration in Next.js is hardcoded to the non-www version (`https://sportsorthopedics.in`), causing all www pages to have canonical URLs pointing to the non-www version.

---

## Root Cause Analysis

### 1. **Hardcoded metadataBase in Root Layout**

**File:** `src/app/layout.tsx` (Line 34)

```typescript
metadataBase: new URL("https://sportsorthopedics.in"),
```

**Impact:**
- Next.js uses `metadataBase` to generate absolute URLs for all metadata including canonical URLs
- When users access `www.sportsorthopedics.in`, Next.js still generates canonical URLs pointing to `sportsorthopedics.in` (non-www)
- Search engines see the canonical tag and mark www pages as duplicates/non-indexable

### 2. **Hardcoded URLs Throughout the Application**

Multiple files contain hardcoded non-www URLs:

**Files with hardcoded URLs:**
- `src/app/layout.tsx` - metadataBase, openGraph.url, authors.url
- `src/app/robots.ts` - sitemap URL
- `src/lib/schema/utils.ts` - Organization schema URLs
- `src/app/page.tsx` - Breadcrumb schema
- `src/app/bone-joint-school/[slug]/page.tsx` - Base URL for schemas
- `src/app/procedure-surgery/[slug]/page.tsx` - Base URL for schemas
- `src/app/surgeons-staff/[slug]/page.tsx` - Base URL for schemas
- `src/app/blogs/[slug]/page.tsx` - Base URL for schemas
- `src/app/contact/page.tsx` - Base URL for schemas
- `next-sitemap.config.cjs` - siteUrl configuration

### 3. **Missing WWW Redirect Configuration**

**File:** `next.config.mjs`

The Next.js configuration has redirects for various paths but **no redirect from www to non-www** (or vice versa). This allows both versions to be accessible, creating duplicate content issues.

### 4. **No Middleware Handling for WWW**

**File:** `src/middleware.ts`

The middleware handles authentication but does not handle www/non-www normalization.

---

## Current Behavior

### What's Happening:

1. User accesses `https://www.sportsorthopedics.in/bone-joint-school/shoulder-pain`
2. Page loads successfully
3. Next.js generates metadata with canonical URL: `https://sportsorthopedics.in/bone-joint-school/shoulder-pain`
4. Search engines see the canonical tag and mark the www version as non-indexable
5. Only the non-www version gets indexed

### HTML Output Example:

```html
<!-- On www.sportsorthopedics.in/blogs -->
<link rel="canonical" href="https://sportsorthopedics.in/blogs" />
<meta property="og:url" content="https://sportsorthopedics.in/blogs" />
```

This tells search engines: "This page is a duplicate, the real page is at the non-www version."

---

## Impact Assessment

### SEO Impact:
- ❌ **Duplicate Content:** Both www and non-www versions are accessible
- ❌ **Split Link Equity:** Backlinks may point to either version, diluting SEO value
- ❌ **Indexation Issues:** Search engines must choose which version to index
- ❌ **Crawl Budget Waste:** Search engines crawl both versions unnecessarily

### User Experience Impact:
- ⚠️ **Inconsistent URLs:** Users may share either version
- ⚠️ **Potential Cookie Issues:** Cookies set on one version may not work on the other
- ⚠️ **Analytics Fragmentation:** Traffic may be split across both domains

---

## Recommended Solutions

### **Solution 1: Server-Side Redirect (RECOMMENDED)**

Implement a permanent redirect from www to non-www at the server/CDN level.

#### Implementation Options:

**Option A: Next.js Middleware (Preferred for Vercel/Node deployments)**

Create or update `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams, search } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // Redirect www to non-www
  if (hostname.startsWith('www.')) {
    const newHostname = hostname.replace('www.', '');
    const newUrl = new URL(request.url);
    newUrl.hostname = newHostname;
    
    return NextResponse.redirect(newUrl, {
      status: 301, // Permanent redirect
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }
  
  // ... rest of existing middleware logic
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**Option B: next.config.mjs (Alternative)**

Add to `next.config.mjs`:

```javascript
async redirects() {
  return [
    // Existing redirects...
    {
      source: '/:path*',
      has: [
        {
          type: 'host',
          value: 'www.sportsorthopedics.in',
        },
      ],
      destination: 'https://sportsorthopedics.in/:path*',
      permanent: true,
    },
  ];
},
```

**Option C: Vercel Configuration (If hosted on Vercel)**

Create/update `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [
        {
          "type": "host",
          "value": "www.sportsorthopedics.in"
        }
      ],
      "destination": "https://sportsorthopedics.in/:path*",
      "permanent": true
    }
  ]
}
```

**Option D: Cloudflare/CDN Level (Most Performant)**

If using Cloudflare or similar CDN, configure redirect rules in the dashboard:
- Source: `www.sportsorthopedics.in/*`
- Destination: `https://sportsorthopedics.in/$1`
- Status: 301 (Permanent)

---

### **Solution 2: Dynamic metadataBase Configuration**

Update the root layout to use dynamic URL detection:

**File:** `src/app/layout.tsx`

```typescript
// Add this helper function at the top
function getBaseUrl() {
  // Check if we're on the server
  if (typeof window === 'undefined') {
    // Use environment variable or default
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://sportsorthopedics.in';
  }
  // On client, use current origin
  return window.location.origin;
}

export const metadata: Metadata = {
  // ... other metadata
  metadataBase: new URL(getBaseUrl()),
  // ... rest of metadata
};
```

**Note:** This is a supplementary solution. The primary fix should be the redirect.

---

### **Solution 3: Environment Variable Configuration**

Create a centralized configuration for all URLs:

**File:** `.env.local` (create if doesn't exist)

```env
NEXT_PUBLIC_SITE_URL=https://sportsorthopedics.in
NEXT_PUBLIC_DOMAIN=https://sportsorthopedics.in
```

**Update all hardcoded URLs to use environment variables:**

```typescript
// Instead of:
metadataBase: new URL("https://sportsorthopedics.in"),

// Use:
metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sportsorthopedics.in"),
```

---

## Implementation Priority

### Phase 1: Immediate (Critical)
1. ✅ **Implement www to non-www redirect** (Solution 1, Option A or C)
2. ✅ **Update metadataBase** to use environment variable (Solution 3)
3. ✅ **Test redirect** on all major pages

### Phase 2: Short-term (Important)
4. ✅ **Update robots.txt** to ensure proper sitemap URL
5. ✅ **Submit updated sitemap** to Google Search Console
6. ✅ **Request re-indexing** of key pages in Search Console
7. ✅ **Update all hardcoded URLs** to use environment variables

### Phase 3: Long-term (Maintenance)
8. ✅ **Monitor Search Console** for indexation improvements
9. ✅ **Set up canonical URL monitoring** in analytics
10. ✅ **Document URL structure** in project documentation

---

## Files Requiring Changes

### Critical Files:

1. **`src/middleware.ts`** - Add www redirect logic
2. **`src/app/layout.tsx`** - Update metadataBase to use env variable
3. **`.env.local`** - Create with NEXT_PUBLIC_SITE_URL
4. **`next-sitemap.config.cjs`** - Update siteUrl to use env variable

### Secondary Files (Update hardcoded URLs):

5. `src/lib/schema/utils.ts` - ORGANIZATION_INFO.url
6. `src/app/robots.ts` - sitemap URL
7. `src/app/page.tsx` - Breadcrumb schema URL
8. `src/app/bone-joint-school/[slug]/page.tsx` - baseUrl
9. `src/app/procedure-surgery/[slug]/page.tsx` - baseUrl
10. `src/app/surgeons-staff/[slug]/page.tsx` - baseUrl
11. `src/app/blogs/[slug]/page.tsx` - baseUrl
12. `src/app/contact/page.tsx` - baseUrl
13. `src/components/layout/SiteFooter.tsx` - Any hardcoded links

---

## Testing Checklist

After implementing the fixes:

### Redirect Testing:
- [ ] Visit `https://www.sportsorthopedics.in` → Should redirect to `https://sportsorthopedics.in`
- [ ] Visit `https://www.sportsorthopedics.in/blogs` → Should redirect to `https://sportsorthopedics.in/blogs`
- [ ] Visit `https://www.sportsorthopedics.in/bone-joint-school/shoulder-pain` → Should redirect
- [ ] Check redirect status code is 301 (permanent)
- [ ] Verify redirect preserves query parameters
- [ ] Test on mobile and desktop

### Canonical URL Testing:
- [ ] View page source on non-www version
- [ ] Verify canonical URL points to non-www version
- [ ] Check Open Graph URL is non-www
- [ ] Verify schema.org URLs are non-www

### Search Console:
- [ ] Submit sitemap with non-www URLs
- [ ] Request indexing of key pages
- [ ] Monitor coverage report for improvements
- [ ] Check for any new errors

---

## Expected Outcomes

### Immediate (1-2 days):
- ✅ All www URLs redirect to non-www with 301 status
- ✅ No duplicate content accessible
- ✅ Consistent canonical URLs across all pages

### Short-term (1-2 weeks):
- ✅ Search engines recognize the redirect
- ✅ www pages removed from index
- ✅ Non-www pages properly indexed
- ✅ Improved crawl efficiency

### Long-term (1-3 months):
- ✅ Consolidated link equity to non-www version
- ✅ Improved search rankings (due to consolidated signals)
- ✅ Better analytics accuracy
- ✅ Cleaner Search Console reports

---

## Additional Recommendations

### 1. **Consistent Internal Linking**
Ensure all internal links use relative paths or non-www absolute URLs:
```typescript
// Good
<Link href="/blogs">Blogs</Link>
<Link href="https://sportsorthopedics.in/blogs">Blogs</Link>

// Avoid
<Link href="https://www.sportsorthopedics.in/blogs">Blogs</Link>
```

### 2. **Update External References**
- Update social media profiles to use non-www URL
- Update business listings (Google My Business, etc.)
- Update email signatures and marketing materials
- Contact major backlink sources to update their links

### 3. **Monitoring Setup**
- Set up Google Analytics property for non-www domain
- Configure Search Console for non-www domain
- Set up uptime monitoring for redirect functionality
- Create alerts for canonical URL issues

### 4. **Documentation**
- Document the chosen URL structure (non-www)
- Add to project README
- Include in developer onboarding materials
- Create a style guide for URL usage

---

## Technical Considerations

### Performance:
- 301 redirects add minimal latency (~10-50ms)
- CDN-level redirects are fastest
- Middleware redirects are acceptable for most use cases

### SEO:
- 301 redirects pass ~90-99% of link equity
- Temporary ranking fluctuations are normal during transition
- Full consolidation takes 1-3 months

### Caching:
- 301 redirects are cached by browsers
- Clear cache during testing
- Use cache-control headers appropriately

---

## Support Resources

### Documentation:
- [Next.js Redirects](https://nextjs.org/docs/app/api-reference/next-config-js/redirects)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Google: Canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Vercel Redirects](https://vercel.com/docs/edge-network/redirects)

### Tools for Testing:
- [Redirect Checker](https://httpstatus.io/)
- [Google Search Console](https://search.google.com/search-console)
- [Screaming Frog SEO Spider](https://www.screamingfrogseoseo.com/)
- [Chrome DevTools Network Tab](chrome://inspect)

---

## Conclusion

The www subdomain indexability issue is caused by:
1. **Lack of www → non-www redirect** (primary cause)
2. **Hardcoded non-www URLs in metadataBase** (secondary cause)

**Recommended Action:**
Implement a 301 redirect from www to non-www using Next.js middleware or CDN configuration. This is the industry-standard solution and will resolve the issue permanently.

**Priority:** HIGH - This affects SEO and should be fixed as soon as possible.

**Estimated Implementation Time:** 1-2 hours for code changes + testing

---

## Questions or Concerns?

If you have any questions about this analysis or need assistance with implementation, please refer to the Next.js documentation or consult with your hosting provider for CDN-level redirect configuration.

---

**Analysis completed by:** Cascade AI  
**Report generated:** November 7, 2025
