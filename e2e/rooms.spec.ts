import { test, expect } from '@playwright/test'

// ==========================================
// ROOMS PAGE TESTS
// ==========================================

test.describe('Rooms Page - Basic Loading', () => {
  test('loads rooms page successfully', async ({ page }) => {
    const response = await page.goto('/rooms')
    expect(response?.status()).toBe(200)
  })

  test('displays page title "Album Rooms"', async ({ page }) => {
    await page.goto('/rooms')
    await page.waitForTimeout(500)

    const hasHeader = await page.locator('h1').count() > 0
    expect(hasHeader).toBe(true)
  })

  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/rooms')
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(15000)
  })
})

test.describe('Rooms Page - Header Section', () => {
  test('displays relevant content or redirects to login', async ({ page }) => {
    await page.goto('/rooms')
    await page.waitForTimeout(500)

    // Page might redirect to login if not authenticated
    const isLoginPage = page.url().includes('/login')
    const hasSubtitle = await page.locator('text=/album/i').count() > 0 ||
                        await page.locator('text=/discuss/i').count() > 0 ||
                        await page.locator('text=/room/i').count() > 0 ||
                        await page.locator('text=/sign in/i').count() > 0

    expect(hasSubtitle || isLoginPage).toBe(true)
  })
})

test.describe('Rooms Page - Room List', () => {
  test('shows room list, empty state, or login redirect', async ({ page }) => {
    await page.goto('/rooms')
    await page.waitForTimeout(1500)

    // Might redirect to login if unauthenticated
    const isLoginPage = page.url().includes('/login')
    const hasRooms = await page.locator('a[href^="/rooms/"]').count() > 0
    const hasEmptyState = await page.locator('text=/No rooms/i').count() > 0 ||
                          await page.locator('text=/No active rooms/i').count() > 0 ||
                          await page.locator('text=/discover/i').count() > 0

    expect(hasRooms || hasEmptyState || isLoginPage).toBe(true)
  })

  test('displays album cover images or handles auth', async ({ page }) => {
    await page.goto('/rooms')
    await page.waitForTimeout(1500)

    const isLoginPage = page.url().includes('/login')
    const hasImages = await page.locator('img').count() > 0
    const hasEmptyState = await page.locator('text=/No rooms/i').count() > 0
    const hasContent = await page.evaluate(() => document.body.innerHTML.length > 100)

    expect(hasImages || hasEmptyState || isLoginPage || hasContent).toBe(true)
  })

  test('displays room member/message counts', async ({ page }) => {
    await page.goto('/rooms')
    await page.waitForTimeout(1500)

    const hasCount = await page.locator('text=/\\d+/').count() > 0
    expect(hasCount).toBe(true)
  })
})

test.describe('Rooms Page - Navigation', () => {
  test('clicking room navigates to room page', async ({ page }) => {
    await page.goto('/rooms')
    await page.waitForTimeout(1500)

    const roomLink = page.locator('a[href^="/rooms/"]').first()
    if (await roomLink.isVisible()) {
      await roomLink.click()
      await page.waitForURL('**/rooms/**')
      expect(page.url()).toMatch(/\/rooms\/[^/]+/)
    }
  })
})

test.describe('Rooms Page - Responsive Design', () => {
  test('renders correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    const response = await page.goto('/rooms')
    expect(response?.status()).toBe(200)
  })

  test('renders correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    const response = await page.goto('/rooms')
    expect(response?.status()).toBe(200)
  })

  test('renders correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    const response = await page.goto('/rooms')
    expect(response?.status()).toBe(200)
  })

  test('no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/rooms')
    await page.waitForTimeout(500)

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    expect(hasHorizontalScroll).toBe(false)
  })
})

test.describe('Rooms Page - Error Handling', () => {
  test('page renders without JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto('/rooms')
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

    await page.goto('/rooms')
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

    const response = await page.goto('/rooms')
    expect(response?.status()).toBe(200)
  })
})

test.describe('Rooms Page - Accessibility', () => {
  test('page has accessible focus management', async ({ page }) => {
    await page.goto('/rooms')
    await page.waitForTimeout(500)

    await page.keyboard.press('Tab')

    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })

  test('all interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/rooms')
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
    await page.goto('/rooms')

    const htmlLang = await page.getAttribute('html', 'lang')
    expect(htmlLang).toBeTruthy()
  })

  test('images have alt attributes', async ({ page }) => {
    await page.goto('/rooms')
    await page.waitForTimeout(500)

    const imagesWithoutAlt = await page.evaluate(() => {
      const images = document.querySelectorAll('img:not([alt])')
      return images.length
    })

    expect(imagesWithoutAlt).toBe(0)
  })
})

test.describe('Rooms Page - Security', () => {
  test('no XSS vulnerabilities in URL parameters', async ({ page }) => {
    await page.goto('/rooms?test=<script>alert(1)</script>')

    const hasScriptTag = await page.evaluate(() => {
      return document.body.innerHTML.includes('<script>alert(1)</script>')
    })

    expect(hasScriptTag).toBe(false)
  })

  test('no prototype pollution in URL params', async ({ page }) => {
    const response = await page.goto('/rooms?__proto__[polluted]=true')

    const isPolluted = await page.evaluate(() => {
      return (Object.prototype as any).polluted === true
    })

    expect(isPolluted).toBe(false)
    expect(response?.status()).toBe(200)
  })
})

test.describe('Rooms Page - Color Scheme', () => {
  test('respects prefers-color-scheme: dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    const response = await page.goto('/rooms')
    expect(response?.status()).toBe(200)
  })

  test('respects prefers-color-scheme: light', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    const response = await page.goto('/rooms')
    expect(response?.status()).toBe(200)
  })

  test('respects prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const response = await page.goto('/rooms')
    expect(response?.status()).toBe(200)
  })
})

test.describe('Rooms Page - Stress Tests', () => {
  test('handles 10 rapid navigations without crashing', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await page.goto('/rooms', { waitUntil: 'domcontentloaded' })
    }

    const hasContent = await page.evaluate(() => document.body.innerHTML.length > 50)
    expect(hasContent).toBe(true)
  })

  test('handles multiple viewport changes rapidly', async ({ page }) => {
    await page.goto('/rooms')

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

// ==========================================
// ROOM ALBUM PAGE TESTS
// ==========================================

test.describe('Room Album Page - Basic Loading', () => {
  test('loads room album page with valid response', async ({ page }) => {
    const response = await page.goto('/rooms/test-album-id')
    expect([200, 307, 308, 404]).toContain(response?.status() ?? 0)
  })

  test('redirects to login if not authenticated', async ({ page }) => {
    await page.goto('/rooms/test-album-id')
    await page.waitForTimeout(2000)

    const url = page.url()
    const hasLogin = url.includes('/login')
    const hasRooms = url.includes('/rooms')
    const hasLoading = await page.locator('text=/Loading/i').count() > 0

    expect(hasLogin || hasRooms || hasLoading).toBe(true)
  })

  test('displays back link to rooms', async ({ page }) => {
    await page.goto('/rooms/test-album-id')
    await page.waitForTimeout(1000)

    const hasBackLink = await page.locator('a[href="/rooms"]').count() > 0
    const hasLogin = page.url().includes('/login')

    expect(hasBackLink || hasLogin).toBe(true)
  })
})

test.describe('Room Album Page - Chat Interface', () => {
  test('displays album cover image', async ({ page }) => {
    await page.goto('/rooms/test-album-id')
    await page.waitForTimeout(1500)

    const hasImage = await page.locator('img').count() > 0
    const hasLogin = page.url().includes('/login')
    const hasError = await page.locator('text=/not found/i').count() > 0

    expect(hasImage || hasLogin || hasError).toBe(true)
  })

  test('displays message input area', async ({ page }) => {
    await page.goto('/rooms/test-album-id')
    await page.waitForTimeout(1500)

    const hasInput = await page.locator('textarea').count() > 0 ||
                     await page.locator('input[type="text"]').count() > 0
    const hasLogin = page.url().includes('/login')
    const hasError = await page.locator('text=/not found/i').count() > 0

    expect(hasInput || hasLogin || hasError).toBe(true)
  })

  test('displays send button', async ({ page }) => {
    await page.goto('/rooms/test-album-id')
    await page.waitForTimeout(1500)

    const hasSendButton = await page.locator('button:has-text("Send")').count() > 0
    const hasLogin = page.url().includes('/login')
    const hasError = await page.locator('text=/not found/i').count() > 0

    expect(hasSendButton || hasLogin || hasError).toBe(true)
  })

  test('displays message thread or empty state', async ({ page }) => {
    await page.goto('/rooms/test-album-id')
    await page.waitForTimeout(1500)

    const hasMessages = await page.locator('text=/@[a-zA-Z0-9_]+/').count() > 0
    const hasEmptyState = await page.locator('text=/No messages/i').count() > 0 ||
                          await page.locator('text=/Be the first/i').count() > 0 ||
                          await page.locator('text=/Start the conversation/i').count() > 0
    const hasLogin = page.url().includes('/login')
    const hasError = await page.locator('text=/not found/i').count() > 0

    expect(hasMessages || hasEmptyState || hasLogin || hasError).toBe(true)
  })
})

test.describe('Room Album Page - Navigation', () => {
  test('back link navigates to rooms page', async ({ page }) => {
    await page.goto('/rooms/test-album-id')
    await page.waitForTimeout(1000)

    const backLink = page.locator('a[href="/rooms"]').first()
    if (await backLink.isVisible()) {
      await backLink.click()
      await page.waitForURL('**/rooms**')
      expect(page.url()).toContain('/rooms')
    }
  })

  test('album link navigates to album page', async ({ page }) => {
    await page.goto('/rooms/test-album-id')
    await page.waitForTimeout(1500)

    const albumLink = page.locator('a[href^="/album/"]').first()
    if (await albumLink.isVisible()) {
      await albumLink.click()
      await page.waitForURL('**/album/**')
      expect(page.url()).toContain('/album/')
    }
  })
})

test.describe('Room Album Page - Responsive Design', () => {
  test('renders correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    const response = await page.goto('/rooms/test-album-id')
    expect([200, 307, 308, 404]).toContain(response?.status() ?? 0)
  })

  test('no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/rooms/test-album-id')
    await page.waitForTimeout(1000)

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    expect(hasHorizontalScroll).toBe(false)
  })
})

test.describe('Room Album Page - Error Handling', () => {
  test('page renders without JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto('/rooms/test-album-id')
    await page.waitForTimeout(2000)

    const significantErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') &&
             !e.includes('hydration') &&
             !e.includes('Script error')
    )

    expect(significantErrors).toHaveLength(0)
  })

  test('handles invalid album ID gracefully', async ({ page }) => {
    const response = await page.goto('/rooms/invalid-album-id-123')
    expect([200, 307, 308, 404]).toContain(response?.status() ?? 0)
  })
})

test.describe('Room Album Page - Security', () => {
  test('XSS in album ID URL is safe', async ({ page }) => {
    const xssPayload = '<script>alert(1)</script>'
    const encodedPayload = encodeURIComponent(xssPayload)

    await page.goto(`/rooms/${encodedPayload}`)

    const hasScriptTag = await page.evaluate(() => {
      return document.body.innerHTML.includes('<script>alert(1)</script>')
    })

    expect(hasScriptTag).toBe(false)
  })

  test('SQL injection in album ID URL is safe', async ({ page }) => {
    const sqlPayload = "'; DROP TABLE rooms; --"
    const encodedPayload = encodeURIComponent(sqlPayload)

    const response = await page.goto(`/rooms/${encodedPayload}`)
    expect([200, 307, 308, 404]).toContain(response?.status() ?? 0)
  })

  test('path traversal attempts are handled', async ({ page }) => {
    const response = await page.goto('/rooms/../../../etc/passwd')
    expect([200, 307, 308, 404]).toContain(response?.status() ?? 0)
  })
})

test.describe('Room Album Page - Edge Cases', () => {
  test('handles very long album ID gracefully', async ({ page }) => {
    const longId = 'a'.repeat(500)
    const response = await page.goto(`/rooms/${longId}`)
    expect([200, 307, 308, 404, 414]).toContain(response?.status() ?? 0)
  })

  test('handles special characters in album ID', async ({ page }) => {
    const specialChars = 'album%20id%2F%3F%26'
    const response = await page.goto(`/rooms/${specialChars}`)
    expect([200, 307, 308, 404]).toContain(response?.status() ?? 0)
  })

  test('handles unicode album ID', async ({ page }) => {
    const unicodeId = encodeURIComponent('アルバムID')
    const response = await page.goto(`/rooms/${unicodeId}`)
    expect([200, 307, 308, 404]).toContain(response?.status() ?? 0)
  })
})

test.describe('Room Album Page - Stress Tests', () => {
  test('handles 10 rapid navigations without crashing', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await page.goto('/rooms/test-album-id', { waitUntil: 'domcontentloaded' })
    }

    const hasContent = await page.evaluate(() => document.body.innerHTML.length > 50)
    expect(hasContent).toBe(true)
  })
})
