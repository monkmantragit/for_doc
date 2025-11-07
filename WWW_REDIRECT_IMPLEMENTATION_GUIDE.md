# WWW to Non-WWW Redirect - Implementation Guide

**Site:** sportsorthopedics.in  
**Objective:** Redirect all www traffic to non-www version with 301 status

---

## Quick Start - Recommended Implementation

### Option 1: Next.js Middleware (RECOMMENDED)

This is the recommended approach for most Next.js deployments.

#### Step 1: Update `src/middleware.ts`

Replace the entire content with:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that don't require authentication
const publicPaths = [
  '/admin/login',
  '/api/admin/auth/login',
  '/api/doctors',
  '/api/appointments'
];

// This function determines if a path is public (accessible without auth)
function isPublicPath(path: string) {
  if (publicPaths.includes(path)) {
    return true;
  }
  
  if (path === '/' || !path.startsWith('/admin')) {
    return true;
  }
  
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // ===== WWW TO NON-WWW REDIRECT =====
  // Redirect www to non-www with 301 permanent redirect
  if (hostname.startsWith('www.')) {
    const newUrl = new URL(request.url);
    newUrl.hostname = hostname.replace('www.', '');
    
    return NextResponse.redirect(newUrl, {
      status: 301, // Permanent redirect
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }
  // ===== END WWW REDIRECT =====
  
  // Allow bypassing auth check with parameter (for login redirect only)
  if (searchParams.get('auth') === 'true') {
    return NextResponse.next();
  }
  
  // Allow public resources like static files
  if (pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|webp)$/)) {
    return NextResponse.next();
  }

  // Allow public paths (non-admin routes)
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // For admin paths, verify authentication
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configure the middleware to run on ALL routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css|woff|woff2|ttf|eot)$).*)',
  ],
};
```

#### Step 2: Create `.env.local` (if it doesn't exist)

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://sportsorthopedics.in
NEXT_PUBLIC_DOMAIN=https://sportsorthopedics.in
NEXT_PUBLIC_BASE_URL=https://sportsorthopedics.in

# Existing environment variables...
```

#### Step 3: Update `src/app/layout.tsx`

Change line 34 from:
```typescript
metadataBase: new URL("https://sportsorthopedics.in"),
```

To:
```typescript
metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sportsorthopedics.in"),
```

Also update line 23 and 41:
```typescript
// Line 23
authors: [{ name: "Sports Orthopedics Institute", url: process.env.NEXT_PUBLIC_SITE_URL || "https://sportsorthopedics.in" }],

// Line 41
url: process.env.NEXT_PUBLIC_SITE_URL || "https://sportsorthopedics.in",
```

#### Step 4: Update `next-sitemap.config.cjs`

Change line 3 from:
```javascript
siteUrl: process.env.SITE_URL || 'https://sportsorthopedics.in',
```

To:
```javascript
siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://sportsorthopedics.in',
```

#### Step 5: Update `src/app/robots.ts`

Change line 10 from:
```typescript
sitemap: 'https://sportsorthopedics.in/sitemap.xml',
```

To:
```typescript
sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sportsorthopedics.in'}/sitemap.xml`,
```

#### Step 6: Update `src/lib/schema/utils.ts`

Change lines 24-25 from:
```typescript
url: 'https://sportsorthopedics.in',
logo: 'https://sportsorthopedics.in/logo.jpg',
```

To:
```typescript
url: process.env.NEXT_PUBLIC_SITE_URL || 'https://sportsorthopedics.in',
logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sportsorthopedics.in'}/logo.jpg`,
```

Also update lines 98-99:
```typescript
image: [
  `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sportsorthopedics.in'}/images/clinic-exterior.jpg`,
  `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sportsorthopedics.in'}/images/clinic-interior.jpg`
],
```

---

## Testing Instructions

### 1. Local Testing

```bash
# Build the application
npm run build

# Start production server
npm start

# Test in another terminal
curl -I http://localhost:3000
# Should return 200 OK

# Test www redirect (requires local DNS setup or hosts file)
# Add to C:\Windows\System32\drivers\etc\hosts:
# 127.0.0.1 www.localhost

curl -I http://www.localhost:3000
# Should return 301 redirect
```

### 2. Production Testing

After deploying:

```bash
# Test non-www (should work)
curl -I https://sportsorthopedics.in
# Expected: 200 OK

# Test www (should redirect)
curl -I https://www.sportsorthopedics.in
# Expected: 301 Moved Permanently
# Location: https://sportsorthopedics.in/

# Test with path
curl -I https://www.sportsorthopedics.in/blogs
# Expected: 301 Moved Permanently
# Location: https://sportsorthopedics.in/blogs

# Test with query parameters
curl -I "https://www.sportsorthopedics.in/blogs?page=2"
# Expected: 301 Moved Permanently
# Location: https://sportsorthopedics.in/blogs?page=2
```

### 3. Browser Testing

1. Open browser in incognito mode
2. Visit `https://www.sportsorthopedics.in`
3. Check URL bar - should show `https://sportsorthopedics.in` (no www)
4. Open DevTools → Network tab
5. Visit `https://www.sportsorthopedics.in/blogs`
6. Check first request - should show:
   - Status: 301 Moved Permanently
   - Location header: https://sportsorthopedics.in/blogs

### 4. SEO Testing

Use these tools to verify:

1. **Redirect Checker:** https://httpstatus.io/
   - Enter: `https://www.sportsorthopedics.in`
   - Should show 301 redirect to non-www

2. **View Page Source:**
   - Visit: `https://sportsorthopedics.in/blogs`
   - View source (Ctrl+U)
   - Find `<link rel="canonical"` - should be non-www
   - Find `<meta property="og:url"` - should be non-www

3. **Google Search Console:**
   - URL Inspection tool
   - Test non-www URL
   - Should show proper canonical

---

## Deployment Checklist

- [ ] Code changes committed to version control
- [ ] `.env.local` created with correct values
- [ ] Build successful locally (`npm run build`)
- [ ] Middleware tested locally
- [ ] Changes deployed to staging (if available)
- [ ] Redirect tested on staging
- [ ] Changes deployed to production
- [ ] Redirect tested on production
- [ ] All test URLs verified (see Testing Instructions)
- [ ] Search Console notified of changes
- [ ] Sitemap resubmitted

---

## Post-Deployment Actions

### Immediate (Day 1):

1. **Verify Redirect:**
   - Test 10-15 different pages with www prefix
   - Confirm all redirect to non-www with 301 status

2. **Check Canonical URLs:**
   - View source of 5-10 key pages
   - Verify canonical tags point to non-www

3. **Monitor Errors:**
   - Check server logs for any redirect issues
   - Monitor error tracking (if configured)

### Week 1:

4. **Google Search Console:**
   - Submit sitemap (non-www version)
   - Request indexing for key pages
   - Monitor coverage report

5. **Analytics:**
   - Verify traffic is being tracked correctly
   - Check for any unusual patterns

### Week 2-4:

6. **Indexation Monitoring:**
   - Check Search Console for www pages removal
   - Monitor non-www pages indexation
   - Look for any crawl errors

7. **Rankings Check:**
   - Monitor key keyword rankings
   - Expect temporary fluctuations (normal)

### Month 2-3:

8. **Full Consolidation:**
   - Verify all www pages removed from index
   - Check link equity consolidation
   - Review overall SEO metrics

---

## Troubleshooting

### Issue: Redirect not working

**Possible causes:**
1. Middleware not deployed
2. CDN/proxy caching old response
3. Browser caching

**Solutions:**
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build

# Clear CDN cache (if using Vercel)
vercel --prod --force

# Test with curl (bypasses browser cache)
curl -I https://www.sportsorthopedics.in
```

### Issue: Redirect loop

**Possible causes:**
1. Conflicting redirects in CDN
2. Multiple middleware rules

**Solutions:**
- Check CDN/hosting provider redirect rules
- Ensure only one redirect rule exists
- Check for conflicting `next.config.mjs` redirects

### Issue: Some pages not redirecting

**Possible causes:**
1. Middleware matcher not catching all routes
2. Static files being served directly

**Solutions:**
- Review middleware `config.matcher`
- Ensure pattern covers all routes
- Test specific problematic URLs

### Issue: Performance degradation

**Possible causes:**
1. Middleware running on every request
2. No caching of redirect

**Solutions:**
- Middleware is optimized (runs in Edge Runtime)
- Add cache headers (already included in code)
- Consider CDN-level redirect for better performance

---

## Alternative Implementation (If Middleware Doesn't Work)

### Option 2: Vercel Configuration

If hosted on Vercel, create `vercel.json` in project root:

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

Then deploy:
```bash
vercel --prod
```

### Option 3: Cloudflare Page Rules

If using Cloudflare:

1. Log in to Cloudflare Dashboard
2. Select your domain
3. Go to Rules → Page Rules
4. Create new rule:
   - URL: `www.sportsorthopedics.in/*`
   - Setting: Forwarding URL
   - Status Code: 301 - Permanent Redirect
   - Destination: `https://sportsorthopedics.in/$1`
5. Save and deploy

---

## Rollback Plan

If issues arise, you can quickly rollback:

### Step 1: Revert Middleware

Comment out the www redirect section in `src/middleware.ts`:

```typescript
// ===== WWW TO NON-WWW REDIRECT =====
// Temporarily disabled
/*
if (hostname.startsWith('www.')) {
  const newUrl = new URL(request.url);
  newUrl.hostname = hostname.replace('www.', '');
  
  return NextResponse.redirect(newUrl, {
    status: 301,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
*/
// ===== END WWW REDIRECT =====
```

### Step 2: Redeploy

```bash
npm run build
# Deploy to production
```

### Step 3: Clear Caches

- Clear CDN cache
- Clear browser cache
- Test both www and non-www versions

---

## Success Metrics

Track these metrics to measure success:

### Technical Metrics:
- ✅ 100% of www URLs return 301 status
- ✅ All canonical URLs point to non-www
- ✅ No 404 errors from redirect
- ✅ Page load time unchanged (< 50ms added latency)

### SEO Metrics:
- ✅ www pages removed from Search Console (2-4 weeks)
- ✅ Non-www pages indexed (verify in Search Console)
- ✅ No duplicate content warnings
- ✅ Improved crawl efficiency

### Business Metrics:
- ✅ Organic traffic maintained or improved
- ✅ Rankings stable or improved (after 4-8 weeks)
- ✅ Consistent URL structure across all platforms

---

## Support

If you encounter issues:

1. Check Next.js documentation: https://nextjs.org/docs/app/building-your-application/routing/middleware
2. Review Vercel docs: https://vercel.com/docs/edge-network/redirects
3. Test with online tools: https://httpstatus.io/
4. Check Search Console for crawl errors

---

**Implementation Guide Created:** November 7, 2025  
**Last Updated:** November 7, 2025  
**Version:** 1.0
