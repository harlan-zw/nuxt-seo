---
title: Protecting Vue Apps from Malicious Crawlers
description: Learn how to protect your Vue application from malicious crawlers and bots.
navigation:
  title: 'Security'
publishedAt: 2024-11-03
updatedAt: 2024-11-03
readTime: 8 mins
keywords:
  - security
  - vue
  - bots
  - malicious crawlers
---

## Introduction

While [robots.txt](/learn/controlling-crawlers/robots-txt) and [meta robots](/learn/controlling-crawlers/meta-tags) provide basic crawler control, they're merely suggestions that can be ignored. A comprehensive security strategy is crucial for protecting sensitive content from malicious crawlers.

**✅ Good Security Practices:**

- Block non-production environments
- Protect development assets
- Rate limit aggressive crawlers
- Authenticate sensitive routes
- Monitor crawler behavior
- Use HTTPS everywhere

**❌ Don't Rely On:**

- robots.txt for sensitive data
- IP blocking alone
- User-agent detection
- Client-side only protection
- Security through obscurity

## Quick Setup

Protect your Vue/Nuxt app from unwanted crawlers:

::code-group

```ts [Basic Middleware]
// server/middleware/security.ts
export default defineEventHandler((event) => {
// Block non-production environments
  if (process.env.NODE_ENV !== 'production') {
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  }

  // Enforce HTTPS
  if (!getRequestHost(event).includes('https')) {
    return sendRedirect(event, `https://${getRequestHost(event)}${event.path}`, 301)
  }
})
```

```ts [Cloudflare Headers]
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          // Basic security headers
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
      }
    }
  }
})
```

```ts [Rate Limiting]
import { rateLimit } from 'express-rate-limit'

export default defineNuxtConfig({
// Add rate limiting to API routes
  serverMiddleware: [
    { path: '/api', handler: rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }) }
  ]
})
```

::

## Environment Protection

### Development & Staging

Always block search engines in non-production environments:

```ts
// server/middleware/block-non-production.ts
export default defineEventHandler((event) => {
  const isProd = process.env.NODE_ENV === 'production'
  const isMainDomain = getRequestHost(event) === 'mysite.com'

  if (!isProd || !isMainDomain) {
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')

    // Also consider basic auth for staging
    if (!event.headers.get('authorization')) {
      setResponseStatus(event, 401)
      setHeader(event, 'WWW-Authenticate', 'Basic')
      return 'Authentication required'
    }
  }
})
```

### Sensitive Routes

Protect admin and user areas:

```ts
// server/middleware/protect-routes.ts
export default defineEventHandler((event) => {
  const protectedPaths = ['/admin', '/dashboard', '/user']

  if (protectedPaths.some(path => event.path.startsWith(path))) {
    // Ensure user is authenticated
    if (!event.context.auth?.user) {
      return sendRedirect(event, '/login')
    }

    // Block indexing of protected content
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  }
})
```

## Crawler Identification

### Good vs Bad Crawlers

Identify legitimate crawlers through:
- Reverse DNS lookup
- IP verification
- Behavior patterns
- Request rate

```ts
// server/utils/verify-crawler.ts
export async function isLegitCrawler(ip: string, userAgent: string) {
  // Example: Verify Googlebot
  if (userAgent.includes('Googlebot')) {
    const hostname = await reverseDns(ip)
    return hostname.endsWith('googlebot.com')
  }
  return false
}
```

### Rate Limiting

Implement tiered rate limiting:

```ts
import { rateLimit } from 'express-rate-limit'

// Different limits for different paths
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})

const crawlerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  skip: req => !req.headers['user-agent']?.includes('bot')
})

export default defineEventHandler((event) => {
  if (event.path.startsWith('/api')) {
    return apiLimiter(event)
  }
  return crawlerLimiter(event)
})
```

## Infrastructure Security

### HTTPS Enforcement

Always redirect HTTP to HTTPS:

```ts
export default defineEventHandler((event) => {
  const proto = event.headers.get('x-forwarded-proto')

  if (proto === 'http') {
    return sendRedirect(
      event,
      `https://${getRequestHost(event)}${event.path}`,
      301
    )
  }
})
```

### Security Headers

Implement robust security headers:

```ts
export default defineNuxtConfig({
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          // Prevent clickjacking
          'X-Frame-Options': 'DENY',
          // Prevent MIME type sniffing
          'X-Content-Type-Options': 'nosniff',
          // Control referrer information
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          // Enable strict CSP in production
          ...(process.env.NODE_ENV === 'production'
            ? {
                'Content-Security-Policy': 'default-src \'self\';'
              }
            : {})
        }
      }
    }
  }
})
```

## Monitoring & Detection

### Logging Suspicious Activity

```ts
// server/middleware/crawler-monitor.ts
export default defineEventHandler((event) => {
  const ua = event.headers.get('user-agent')
  const ip = getRequestIP(event)

  // Log suspicious patterns
  if (isSuspiciousPattern(ua, ip)) {
    console.warn(`Suspicious crawler: ${ip} with UA: ${ua}`)
    // Consider blocking or rate limiting
  }
})
```

### Using Web Application Firewalls

Consider using services like Cloudflare or AWS WAF to:
- Block malicious IPs
- Prevent DDoS attacks
- Filter suspicious requests
- Monitor traffic patterns

## Common Attacks

### Content Scraping

Prevent automated content theft:

```ts
export default defineEventHandler((event) => {
  const requests = getRequestCount(getRequestIP(event))

  if (requests > 100) {
    setResponseStatus(event, 429)
    return 'Too Many Requests'
  }

  // Add slight delays to automated requests
  if (isBot(event.headers.get('user-agent'))) {
    await new Promise(r => setTimeout(r, 500))
  }
})
```

### Form Spam

Protect forms from bot submissions:

```ts
// server/api/contact.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Honeypot check
  if (body.website) { // hidden field
    return { success: false }
  }

  // Rate limiting
  if (exceedsRateLimit(getRequestIP(event))) {
    return createError({
      statusCode: 429,
      message: 'Too many attempts'
    })
  }

// Process legitimate submission
})
```

## Related

### Core Concepts
- [Web Crawler Basics](/learn/controlling-crawlers) - How crawlers work
- [Robots.txt Guide](/learn/controlling-crawlers/robots-txt) - Basic crawler control
- [Meta Robots](/learn/controlling-crawlers/meta-tags) - Page-level control

### Additional Resources
- [Google's Security Guidelines](https://developers.google.com/search/docs/advanced/security/security-checklist)
- [OWASP Security Practices](https://owasp.org/www-project-web-security-testing-guide/)
- [Cloudflare's Bot Management](https://www.cloudflare.com/products/bot-management/)
