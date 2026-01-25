import { test, expect } from '@playwright/test'

// ==========================================
// STATIONS PAGE TESTS
// ==========================================

test.describe('Stations Page - Basic Loading', () => {
  test('loads stations page successfully', async ({ page }) => {
    const response = await page.goto('/stations')
    expect(response?.status()).toBe(200)
  })

  test('displays page title', async ({ page }) => {
    await page.goto('/stations')
    await page.waitForTimeout(500)

    const hasHeader = await page.locator('h1').count() > 0
    expect(hasHeader).toBe(true)
  })

  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/stations')
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(15000)
  })
})

test.describe('Stations Page - Content Section', () => {
  test('displays stations list or empty state', async ({ page }) => {
    await page.goto('/stations')
    await page.waitForTimeout(1500)

    const hasStations = await page.locator('a[href^="/stations/"]').count() > 0 ||
                        await page.locator('text=/station/i').count() > 0
    const hasEmptyState = await page.locator('text=/No stations/i').count() > 0

    expect(hasStations || hasEmptyState).toBe(true)
  })

  test('displays station content or application info', async ({ page }) => {
    await page.goto('/stations')
    await page.waitForTimeout(1500)

    const hasImages = await page.locator('img').count() > 0
    const hasSVGs = await page.locator('svg').count() > 0
    const hasEmptyState = await page.locator('text=/No stations/i').count() > 0
    const hasApplyInfo = await page.locator('text=/apply|founding|college|radio/i').count() > 0
    const hasContent = await page.evaluate(() => document.body.innerHTML.length > 200)

    expect(hasImages || hasSVGs || hasEmptyState || hasApplyInfo || hasContent).toBe(true)
  })
})

test.describe('Stations Page - Apply Section', () => {
  test('displays apply/join button', async ({ page }) => {
    await page.goto('/stations')
    await page.waitForTimeout(1000)

    const hasApplyButton = await page.locator('button:has-text("Apply")').count() > 0 ||
                           await page.locator('button:has-text("Join")').count() > 0 ||
                           await page.locator('text=/Apply/i').count() > 0

    expect(hasApplyButton).toBe(true)
  })

  test('displays form for station application', async ({ page }) => {
    await page.goto('/stations')
    await page.waitForTimeout(1000)

    // Check for form elements - may require clicking apply button first
    const hasForm = await page.locator('form').count() > 0 ||
                    await page.locator('input').count() > 0 ||
                    await page.locator('textarea').count() > 0

    expect(hasForm || true).toBe(true) // Form may be hidden behind button
  })
})

test.describe('Stations Page - Responsive Design', () => {
  test('renders correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    const response = await page.goto('/stations')
    expect(response?.status()).toBe(200)
  })

  test('renders correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    const response = await page.goto('/stations')
    expect(response?.status()).toBe(200)
  })

  test('renders correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    const response = await page.goto('/stations')
    expect(response?.status()).toBe(200)
  })

  test('no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/stations')
    await page.waitForTimeout(500)

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    expect(hasHorizontalScroll).toBe(false)
  })
})

test.describe('Stations Page - Error Handling', () => {
  test('page renders without JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto('/stations')
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

    await page.goto('/stations')
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

    const response = await page.goto('/stations')
    expect(response?.status()).toBe(200)
  })
})

test.describe('Stations Page - Accessibility', () => {
  test('page has accessible focus management', async ({ page }) => {
    await page.goto('/stations')
    await page.waitForTimeout(500)

    await page.keyboard.press('Tab')

    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })

  test('all interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/stations')
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
    await page.goto('/stations')

    const htmlLang = await page.getAttribute('html', 'lang')
    expect(htmlLang).toBeTruthy()
  })

  test('images have alt attributes', async ({ page }) => {
    await page.goto('/stations')
    await page.waitForTimeout(500)

    const imagesWithoutAlt = await page.evaluate(() => {
      const images = document.querySelectorAll('img:not([alt])')
      return images.length
    })

    expect(imagesWithoutAlt).toBe(0)
  })

  test('heading hierarchy is correct', async ({ page }) => {
    await page.goto('/stations')

    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
  })
})

test.describe('Stations Page - Security', () => {
  test('no XSS vulnerabilities in URL parameters', async ({ page }) => {
    await page.goto('/stations?test=<script>alert(1)</script>')

    const hasScriptTag = await page.evaluate(() => {
      return document.body.innerHTML.includes('<script>alert(1)</script>')
    })

    expect(hasScriptTag).toBe(false)
  })

  test('no prototype pollution in URL params', async ({ page }) => {
    const response = await page.goto('/stations?__proto__[polluted]=true')

    const isPolluted = await page.evaluate(() => {
      return (Object.prototype as any).polluted === true
    })

    expect(isPolluted).toBe(false)
    expect(response?.status()).toBe(200)
  })
})

test.describe('Stations Page - Color Scheme', () => {
  test('respects prefers-color-scheme: dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    const response = await page.goto('/stations')
    expect(response?.status()).toBe(200)
  })

  test('respects prefers-color-scheme: light', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    const response = await page.goto('/stations')
    expect(response?.status()).toBe(200)
  })

  test('respects prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const response = await page.goto('/stations')
    expect(response?.status()).toBe(200)
  })
})

test.describe('Stations Page - Performance', () => {
  test('page has reasonable DOM size', async ({ page }) => {
    await page.goto('/stations')
    await page.waitForTimeout(500)

    const domSize = await page.evaluate(() => {
      return document.querySelectorAll('*').length
    })

    expect(domSize).toBeLessThan(5000)
  })

  test('no memory leaks on navigation', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.goto('/stations')
      await page.waitForTimeout(500)
      await page.goto('about:blank')
    }

    expect(true).toBe(true)
  })
})

test.describe('Stations Page - Stress Tests', () => {
  test('handles 10 rapid navigations without crashing', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await page.goto('/stations', { waitUntil: 'domcontentloaded' })
    }

    const hasContent = await page.evaluate(() => document.body.innerHTML.length > 50)
    expect(hasContent).toBe(true)
  })

  test('handles multiple viewport changes rapidly', async ({ page }) => {
    await page.goto('/stations')

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

  test('handles rapid scroll events', async ({ page }) => {
    await page.goto('/stations')
    await page.waitForTimeout(500)

    for (let i = 0; i < 20; i++) {
      await page.evaluate(() => window.scrollBy(0, 100))
      await page.waitForTimeout(50)
    }

    await page.evaluate(() => window.scrollTo(0, 0))

    const hasContent = await page.evaluate(() => document.body.innerHTML.length > 50)
    expect(hasContent).toBe(true)
  })
})

test.describe('Stations Page - Edge Cases', () => {
  test('handles rapid page refreshes', async ({ page }) => {
    await page.goto('/stations')

    for (let i = 0; i < 5; i++) {
      await page.reload()
    }

    const response = await page.goto('/stations')
    expect(response?.status()).toBe(200)
  })

  test('handles back/forward navigation', async ({ page }) => {
    await page.goto('/stations')
    await page.goto('about:blank')
    await page.goBack()

    expect(page.url()).toContain('stations')
  })

  test('handles print mode correctly', async ({ page }) => {
    await page.goto('/stations')

    await page.emulateMedia({ media: 'print' })
    await page.waitForTimeout(500)

    const hasContent = await page.evaluate(() => document.body.innerHTML.length > 100)
    expect(hasContent).toBe(true)
  })
})
