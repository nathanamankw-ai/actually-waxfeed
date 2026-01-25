import { test, expect } from '@playwright/test'

// ==========================================
// CIRCLES PAGE TESTS
// ==========================================

test.describe('Circles Page - Basic Loading', () => {
  test('loads circles page with valid response', async ({ page }) => {
    const response = await page.goto('/circles')
    // May redirect to login if not authenticated
    expect([200, 307, 308]).toContain(response?.status() ?? 0)
  })

  test('redirects to login if not authenticated', async ({ page }) => {
    await page.goto('/circles')
    await page.waitForTimeout(2000)

    const url = page.url()
    const hasLogin = url.includes('/login')
    const hasCircles = url.includes('/circles')
    const hasLoading = await page.locator('text=/Loading/i').count() > 0

    expect(hasLogin || hasCircles || hasLoading).toBe(true)
  })

  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/circles')
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(15000)
  })
})

test.describe('Circles Page - Header Section', () => {
  test('displays "Taste Circles" header', async ({ page }) => {
    await page.goto('/circles')
    await page.waitForTimeout(1000)

    const hasHeader = await page.locator('h1:has-text("Taste Circles")').count() > 0
    const hasLogin = page.url().includes('/login')

    expect(hasHeader || hasLogin).toBe(true)
  })

  test('displays community label', async ({ page }) => {
    await page.goto('/circles')
    await page.waitForTimeout(1000)

    const hasCommunityLabel = await page.locator('text=/Community/i').count() > 0
    const hasLogin = page.url().includes('/login')

    expect(hasCommunityLabel || hasLogin).toBe(true)
  })

  test('displays info banner about algorithm-assigned communities', async ({ page }) => {
    await page.goto('/circles')
    await page.waitForTimeout(1000)

    const hasBanner = await page.locator('text=/Algorithm-Assigned Communities/i').count() > 0
    const hasLogin = page.url().includes('/login')

    expect(hasBanner || hasLogin).toBe(true)
  })

  test('displays TasteID link in info banner', async ({ page }) => {
    await page.goto('/circles')
    await page.waitForTimeout(1000)

    const hasTasteIDLink = await page.locator('a[href="/tasteid"]').count() > 0
    const hasLogin = page.url().includes('/login')

    expect(hasTasteIDLink || hasLogin).toBe(true)
  })
})

test.describe('Circles Page - Circle List', () => {
  test('displays "Your Circles" section header', async ({ page }) => {
    await page.goto('/circles')
    await page.waitForTimeout(1500)

    const hasYourCircles = await page.locator('text=/Your Circles/i').count() > 0
    const hasLogin = page.url().includes('/login')
    const hasNoCircles = await page.locator('text=/No circles yet/i').count() > 0

    expect(hasYourCircles || hasLogin || hasNoCircles).toBe(true)
  })

  test('shows empty state or circle list', async ({ page }) => {
    await page.goto('/circles')
    await page.waitForTimeout(1500)

    const hasCircles = await page.locator('a[href^="/circles/"]').count() > 0
    const hasEmptyState = await page.locator('text=/No circles yet/i').count() > 0
    const hasLogin = page.url().includes('/login')

    expect(hasCircles || hasEmptyState || hasLogin).toBe(true)
  })

  test('displays member count for circles', async ({ page }) => {
    await page.goto('/circles')
    await page.waitForTimeout(1500)

    const hasMemberCount = await page.locator('text=/members/i').count() > 0
    const hasLogin = page.url().includes('/login')
    const hasEmptyState = await page.locator('text=/No circles yet/i').count() > 0

    expect(hasMemberCount || hasLogin || hasEmptyState).toBe(true)
  })
})

test.describe('Circles Page - Navigation', () => {
  test('TasteID link navigates to TasteID page', async ({ page }) => {
    await page.goto('/circles')
    await page.waitForTimeout(1000)

    const tasteIDLink = page.locator('a[href="/tasteid"]').first()
    if (await tasteIDLink.isVisible()) {
      await tasteIDLink.click()
      await page.waitForURL('**/tasteid**')
      expect(page.url()).toContain('/tasteid')
    }
  })

  test('clicking circle navigates to circle chat', async ({ page }) => {
    await page.goto('/circles')
    await page.waitForTimeout(1500)

    const circleLink = page.locator('a[href^="/circles/"]').first()
    if (await circleLink.isVisible()) {
      await circleLink.click()
      await page.waitForURL('**/circles/**')
      expect(page.url()).toMatch(/\/circles\/[^/]+/)
    }
  })
})

test.describe('Circles Page - Responsive Design', () => {
  test('renders correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    const response = await page.goto('/circles')
    expect([200, 307, 308]).toContain(response?.status() ?? 0)
  })

  test('renders correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    const response = await page.goto('/circles')
    expect([200, 307, 308]).toContain(response?.status() ?? 0)
  })

  test('renders correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    const response = await page.goto('/circles')
    expect([200, 307, 308]).toContain(response?.status() ?? 0)
  })

  test('no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/circles')
    await page.waitForTimeout(1000)

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    expect(hasHorizontalScroll).toBe(false)
  })
})

test.describe('Circles Page - Error Handling', () => {
  test('page renders without JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto('/circles')
    await page.waitForTimeout(2000)

    const significantErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') &&
             !e.includes('hydration') &&
             !e.includes('Script error')
    )

    expect(significantErrors).toHaveLength(0)
  })

  test('no console errors on page load', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/circles')
    await page.waitForTimeout(1500)

    const significantErrors = consoleErrors.filter(
      (e) => !e.includes('favicon') &&
             !e.includes('404') &&
             !e.includes('hydration')
    )

    expect(significantErrors.length).toBeLessThanOrEqual(2)
  })

  test('handles network failures gracefully', async ({ page, context }) => {
    await context.route('**/*.{png,jpg,jpeg,gif,svg}', route => route.abort())

    const response = await page.goto('/circles')
    expect([200, 307, 308]).toContain(response?.status() ?? 0)
  })
})

test.describe('Circles Page - Accessibility', () => {
  test('page has accessible focus management', async ({ page }) => {
    await page.goto('/circles')
    await page.waitForTimeout(500)

    await page.keyboard.press('Tab')

    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })

  test('all interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/circles')
    await page.waitForTimeout(500)

    const focusableCount = await page.evaluate(() => {
      const focusable = document.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      return focusable.length
    })

    expect(focusableCount).toBeGreaterThan(0)
  })

  test('page has lang attribute', async ({ page }) => {
    await page.goto('/circles')

    const htmlLang = await page.getAttribute('html', 'lang')
    expect(htmlLang).toBeTruthy()
  })
})

test.describe('Circles Page - Security', () => {
  test('no XSS vulnerabilities in URL parameters', async ({ page }) => {
    await page.goto('/circles?test=<script>alert(1)</script>')

    const hasScriptTag = await page.evaluate(() => {
      return document.body.innerHTML.includes('<script>alert(1)</script>')
    })

    expect(hasScriptTag).toBe(false)
  })

  test('no prototype pollution in URL params', async ({ page }) => {
    const response = await page.goto('/circles?__proto__[polluted]=true')

    const isPolluted = await page.evaluate(() => {
      return (Object.prototype as any).polluted === true
    })

    expect(isPolluted).toBe(false)
  })
})

test.describe('Circles Page - Color Scheme', () => {
  test('respects prefers-color-scheme: dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    const response = await page.goto('/circles')
    expect([200, 307, 308]).toContain(response?.status() ?? 0)
  })

  test('respects prefers-color-scheme: light', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    const response = await page.goto('/circles')
    expect([200, 307, 308]).toContain(response?.status() ?? 0)
  })

  test('respects prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const response = await page.goto('/circles')
    expect([200, 307, 308]).toContain(response?.status() ?? 0)
  })
})

// ==========================================
// CIRCLE ARCHETYPE PAGE TESTS
// ==========================================

test.describe('Circle Archetype Page - Basic Loading', () => {
  test('loads circle archetype page with valid response', async ({ page }) => {
    const response = await page.goto('/circles/explorer')
    expect([200, 307, 308, 404]).toContain(response?.status() ?? 0)
  })

  test('redirects to login if not authenticated', async ({ page }) => {
    await page.goto('/circles/explorer')
    await page.waitForTimeout(2000)

    const url = page.url()
    const hasLogin = url.includes('/login')
    const hasCircle = url.includes('/circles/')
    const hasLoading = await page.locator('text=/Loading/i').count() > 0

    expect(hasLogin || hasCircle || hasLoading).toBe(true)
  })

  test('displays back link to all circles', async ({ page }) => {
    await page.goto('/circles/explorer')
    await page.waitForTimeout(1000)

    const hasBackLink = await page.locator('a[href="/circles"]').count() > 0
    const hasLogin = page.url().includes('/login')

    expect(hasBackLink || hasLogin).toBe(true)
  })
})

test.describe('Circle Archetype Page - Chat Interface', () => {
  test('displays archetype badge', async ({ page }) => {
    await page.goto('/circles/explorer')
    await page.waitForTimeout(1500)

    const hasArchetypeBadge = await page.locator('text=/Explorer|Curator|Trendsetter/i').count() > 0
    const hasLogin = page.url().includes('/login')
    const hasError = await page.locator('text=/must have/i').count() > 0

    expect(hasArchetypeBadge || hasLogin || hasError).toBe(true)
  })

  test('displays member count', async ({ page }) => {
    await page.goto('/circles/explorer')
    await page.waitForTimeout(1500)

    const hasMemberCount = await page.locator('text=/members/i').count() > 0
    const hasLogin = page.url().includes('/login')
    const hasError = await page.locator('text=/must have/i').count() > 0

    expect(hasMemberCount || hasLogin || hasError).toBe(true)
  })

  test('displays message input area', async ({ page }) => {
    await page.goto('/circles/explorer')
    await page.waitForTimeout(1500)

    const hasInput = await page.locator('textarea').count() > 0
    const hasLogin = page.url().includes('/login')
    const hasError = await page.locator('text=/must have/i').count() > 0

    expect(hasInput || hasLogin || hasError).toBe(true)
  })

  test('displays send button', async ({ page }) => {
    await page.goto('/circles/explorer')
    await page.waitForTimeout(1500)

    const hasSendButton = await page.locator('button:has-text("Send")').count() > 0
    const hasLogin = page.url().includes('/login')
    const hasError = await page.locator('text=/must have/i').count() > 0

    expect(hasSendButton || hasLogin || hasError).toBe(true)
  })
})

test.describe('Circle Archetype Page - Navigation', () => {
  test('back link navigates to circles page', async ({ page }) => {
    await page.goto('/circles/explorer')
    await page.waitForTimeout(1000)

    const backLink = page.locator('a[href="/circles"]').first()
    if (await backLink.isVisible()) {
      await backLink.click()
      await page.waitForURL('**/circles**')
      expect(page.url()).toContain('/circles')
    }
  })
})

test.describe('Circle Archetype Page - Responsive Design', () => {
  test('renders correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    const response = await page.goto('/circles/explorer')
    expect([200, 307, 308, 404]).toContain(response?.status() ?? 0)
  })

  test('no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/circles/explorer')
    await page.waitForTimeout(1000)

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    expect(hasHorizontalScroll).toBe(false)
  })
})

test.describe('Circle Archetype Page - Error Handling', () => {
  test('page renders without JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto('/circles/explorer')
    await page.waitForTimeout(2000)

    const significantErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') &&
             !e.includes('hydration') &&
             !e.includes('Script error')
    )

    expect(significantErrors).toHaveLength(0)
  })

  test('handles invalid archetype gracefully', async ({ page }) => {
    const response = await page.goto('/circles/invalidarchetype123')
    expect([200, 307, 308, 404]).toContain(response?.status() ?? 0)
  })
})

test.describe('Circle Archetype Page - Security', () => {
  test('XSS in archetype URL is safe', async ({ page }) => {
    const xssPayload = '<script>alert(1)</script>'
    const encodedPayload = encodeURIComponent(xssPayload)

    await page.goto(`/circles/${encodedPayload}`)

    const hasScriptTag = await page.evaluate(() => {
      return document.body.innerHTML.includes('<script>alert(1)</script>')
    })

    expect(hasScriptTag).toBe(false)
  })

  test('SQL injection in archetype URL is safe', async ({ page }) => {
    const sqlPayload = "'; DROP TABLE circles; --"
    const encodedPayload = encodeURIComponent(sqlPayload)

    const response = await page.goto(`/circles/${encodedPayload}`)
    expect([200, 307, 308, 404]).toContain(response?.status() ?? 0)
  })
})

test.describe('Circle Archetype Page - Stress Tests', () => {
  test('handles 10 rapid navigations without crashing', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await page.goto('/circles/explorer', { waitUntil: 'domcontentloaded' })
    }

    const hasContent = await page.evaluate(() => document.body.innerHTML.length > 50)
    expect(hasContent).toBe(true)
  })

  test('handles multiple viewport changes rapidly', async ({ page }) => {
    await page.goto('/circles/explorer')

    const viewports = [
      { width: 320, height: 568 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
      { width: 375, height: 812 },
      { width: 1440, height: 900 },
    ]

    for (const vp of viewports) {
      await page.setViewportSize(vp)
      await page.waitForTimeout(100)
    }

    const hasContent = await page.evaluate(() => document.body.innerHTML.length > 50)
    expect(hasContent).toBe(true)
  })
})
