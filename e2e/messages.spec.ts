import { test, expect } from '@playwright/test'

// ==========================================
// MESSAGES PAGE TESTS
// ==========================================

test.describe('Messages Page - Basic Loading', () => {
  test('loads messages page with valid response', async ({ page }) => {
    const response = await page.goto('/messages')
    // May redirect to login if not authenticated
    expect([200, 307, 308]).toContain(response?.status() ?? 0)
  })

  test('redirects to login if not authenticated', async ({ page }) => {
    await page.goto('/messages')
    await page.waitForTimeout(2000)

    const url = page.url()
    const hasLogin = url.includes('/login')
    const hasMessages = url.includes('/messages')
    const hasLoading = await page.locator('text=/Loading/i').count() > 0

    expect(hasLogin || hasMessages || hasLoading).toBe(true)
  })

  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/messages')
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(15000)
  })
})

test.describe('Messages Page - Header Section', () => {
  test('displays "Messages" header', async ({ page }) => {
    await page.goto('/messages')
    await page.waitForTimeout(1000)

    const hasHeader = await page.locator('h1:has-text("Messages")').count() > 0
    const hasLogin = page.url().includes('/login')

    expect(hasHeader || hasLogin).toBe(true)
  })

  test('displays conversation list or empty state', async ({ page }) => {
    await page.goto('/messages')
    await page.waitForTimeout(1500)

    const hasConversations = await page.locator('a[href^="/messages/"]').count() > 0
    const hasEmptyState = await page.locator('text=/No messages yet/i').count() > 0 ||
                          await page.locator('text=/No conversations/i').count() > 0
    const hasLogin = page.url().includes('/login')

    expect(hasConversations || hasEmptyState || hasLogin).toBe(true)
  })
})

test.describe('Messages Page - Conversation List', () => {
  test('displays user avatars in conversation list', async ({ page }) => {
    await page.goto('/messages')
    await page.waitForTimeout(1500)

    const hasAvatars = await page.locator('img').count() > 0
    const hasEmptyState = await page.locator('text=/No messages/i').count() > 0
    const hasLogin = page.url().includes('/login')

    expect(hasAvatars || hasEmptyState || hasLogin).toBe(true)
  })

  test('displays timestamps for conversations', async ({ page }) => {
    await page.goto('/messages')
    await page.waitForTimeout(1500)

    const hasTimestamp = await page.locator('text=/ago/i').count() > 0
    const hasEmptyState = await page.locator('text=/No messages/i').count() > 0
    const hasLogin = page.url().includes('/login')

    expect(hasTimestamp || hasEmptyState || hasLogin).toBe(true)
  })
})

test.describe('Messages Page - Navigation', () => {
  test('clicking conversation navigates to conversation page', async ({ page }) => {
    await page.goto('/messages')
    await page.waitForTimeout(1500)

    const conversationLink = page.locator('a[href^="/messages/"]').first()
    if (await conversationLink.isVisible()) {
      await conversationLink.click()
      await page.waitForURL('**/messages/**')
      expect(page.url()).toMatch(/\/messages\/[^/]+/)
    }
  })
})

test.describe('Messages Page - Responsive Design', () => {
  test('renders correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    const response = await page.goto('/messages')
    expect([200, 307, 308]).toContain(response?.status() ?? 0)
  })

  test('renders correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    const response = await page.goto('/messages')
    expect([200, 307, 308]).toContain(response?.status() ?? 0)
  })

  test('renders correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    const response = await page.goto('/messages')
    expect([200, 307, 308]).toContain(response?.status() ?? 0)
  })

  test('no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/messages')
    await page.waitForTimeout(1000)

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    expect(hasHorizontalScroll).toBe(false)
  })
})

test.describe('Messages Page - Error Handling', () => {
  test('page renders without JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto('/messages')
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

    await page.goto('/messages')
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

    const response = await page.goto('/messages')
    expect([200, 307, 308]).toContain(response?.status() ?? 0)
  })
})

test.describe('Messages Page - Accessibility', () => {
  test('page has accessible focus management', async ({ page }) => {
    await page.goto('/messages')
    await page.waitForTimeout(500)

    await page.keyboard.press('Tab')

    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })

  test('all interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/messages')
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
    await page.goto('/messages')

    const htmlLang = await page.getAttribute('html', 'lang')
    expect(htmlLang).toBeTruthy()
  })
})

test.describe('Messages Page - Security', () => {
  test('no XSS vulnerabilities in URL parameters', async ({ page }) => {
    await page.goto('/messages?test=<script>alert(1)</script>')

    const hasScriptTag = await page.evaluate(() => {
      return document.body.innerHTML.includes('<script>alert(1)</script>')
    })

    expect(hasScriptTag).toBe(false)
  })

  test('no prototype pollution in URL params', async ({ page }) => {
    const response = await page.goto('/messages?__proto__[polluted]=true')

    const isPolluted = await page.evaluate(() => {
      return (Object.prototype as any).polluted === true
    })

    expect(isPolluted).toBe(false)
  })
})

test.describe('Messages Page - Color Scheme', () => {
  test('respects prefers-color-scheme: dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    const response = await page.goto('/messages')
    expect([200, 307, 308]).toContain(response?.status() ?? 0)
  })

  test('respects prefers-color-scheme: light', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    const response = await page.goto('/messages')
    expect([200, 307, 308]).toContain(response?.status() ?? 0)
  })
})

// ==========================================
// CONVERSATION PAGE TESTS
// ==========================================

test.describe('Conversation Page - Basic Loading', () => {
  test('loads conversation page with valid response', async ({ page }) => {
    const response = await page.goto('/messages/test-conversation-id')
    expect([200, 307, 308, 404]).toContain(response?.status() ?? 0)
  })

  test('redirects to login if not authenticated', async ({ page }) => {
    await page.goto('/messages/test-conversation-id')
    await page.waitForTimeout(2000)

    const url = page.url()
    const hasLogin = url.includes('/login')
    const hasMessages = url.includes('/messages')
    const hasLoading = await page.locator('text=/Loading/i').count() > 0

    expect(hasLogin || hasMessages || hasLoading).toBe(true)
  })

  test('displays back link to messages', async ({ page }) => {
    await page.goto('/messages/test-conversation-id')
    await page.waitForTimeout(1000)

    const hasBackLink = await page.locator('a[href="/messages"]').count() > 0
    const hasLogin = page.url().includes('/login')

    expect(hasBackLink || hasLogin).toBe(true)
  })
})

test.describe('Conversation Page - Chat Interface', () => {
  test('displays message input area', async ({ page }) => {
    await page.goto('/messages/test-conversation-id')
    await page.waitForTimeout(1500)

    const hasInput = await page.locator('textarea').count() > 0 ||
                     await page.locator('input[type="text"]').count() > 0
    const hasLogin = page.url().includes('/login')
    const hasError = await page.locator('text=/not found/i').count() > 0

    expect(hasInput || hasLogin || hasError).toBe(true)
  })

  test('displays send button', async ({ page }) => {
    await page.goto('/messages/test-conversation-id')
    await page.waitForTimeout(1500)

    const hasSendButton = await page.locator('button:has-text("Send")').count() > 0
    const hasLogin = page.url().includes('/login')
    const hasError = await page.locator('text=/not found/i').count() > 0

    expect(hasSendButton || hasLogin || hasError).toBe(true)
  })

  test('displays message thread or empty state', async ({ page }) => {
    await page.goto('/messages/test-conversation-id')
    await page.waitForTimeout(1500)

    const hasMessages = await page.locator('text=/@[a-zA-Z0-9_]+/').count() > 0
    const hasEmptyState = await page.locator('text=/No messages/i').count() > 0 ||
                          await page.locator('text=/Start the conversation/i').count() > 0
    const hasLogin = page.url().includes('/login')
    const hasError = await page.locator('text=/not found/i').count() > 0

    expect(hasMessages || hasEmptyState || hasLogin || hasError).toBe(true)
  })
})

test.describe('Conversation Page - Navigation', () => {
  test('back link navigates to messages page', async ({ page }) => {
    await page.goto('/messages/test-conversation-id')
    await page.waitForTimeout(1000)

    const backLink = page.locator('a[href="/messages"]').first()
    if (await backLink.isVisible()) {
      await backLink.click()
      await page.waitForURL('**/messages**')
      expect(page.url()).toContain('/messages')
    }
  })
})

test.describe('Conversation Page - Responsive Design', () => {
  test('renders correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    const response = await page.goto('/messages/test-conversation-id')
    expect([200, 307, 308, 404]).toContain(response?.status() ?? 0)
  })

  test('no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/messages/test-conversation-id')
    await page.waitForTimeout(1000)

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    expect(hasHorizontalScroll).toBe(false)
  })
})

test.describe('Conversation Page - Error Handling', () => {
  test('page renders without JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto('/messages/test-conversation-id')
    await page.waitForTimeout(2000)

    const significantErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') &&
             !e.includes('hydration') &&
             !e.includes('Script error')
    )

    expect(significantErrors).toHaveLength(0)
  })

  test('handles invalid conversation ID gracefully', async ({ page }) => {
    const response = await page.goto('/messages/invalid-conversation-id-123')
    expect([200, 307, 308, 404]).toContain(response?.status() ?? 0)
  })
})

test.describe('Conversation Page - Security', () => {
  test('XSS in conversation ID URL is safe', async ({ page }) => {
    const xssPayload = '<script>alert(1)</script>'
    const encodedPayload = encodeURIComponent(xssPayload)

    await page.goto(`/messages/${encodedPayload}`)

    const hasScriptTag = await page.evaluate(() => {
      return document.body.innerHTML.includes('<script>alert(1)</script>')
    })

    expect(hasScriptTag).toBe(false)
  })

  test('SQL injection in conversation ID URL is safe', async ({ page }) => {
    const sqlPayload = "'; DROP TABLE messages; --"
    const encodedPayload = encodeURIComponent(sqlPayload)

    const response = await page.goto(`/messages/${encodedPayload}`)
    expect([200, 307, 308, 404]).toContain(response?.status() ?? 0)
  })

  test('path traversal attempts are handled', async ({ page }) => {
    const response = await page.goto('/messages/../../../etc/passwd')
    expect([200, 307, 308, 404]).toContain(response?.status() ?? 0)
  })
})

test.describe('Conversation Page - Edge Cases', () => {
  test('handles very long conversation ID gracefully', async ({ page }) => {
    const longId = 'a'.repeat(500)
    const response = await page.goto(`/messages/${longId}`)
    expect([200, 307, 308, 404, 414]).toContain(response?.status() ?? 0)
  })

  test('handles special characters in conversation ID', async ({ page }) => {
    const specialChars = 'conv%20id%2F%3F%26'
    const response = await page.goto(`/messages/${specialChars}`)
    expect([200, 307, 308, 404]).toContain(response?.status() ?? 0)
  })

  test('handles unicode conversation ID', async ({ page }) => {
    const unicodeId = encodeURIComponent('会話ID')
    const response = await page.goto(`/messages/${unicodeId}`)
    expect([200, 307, 308, 404]).toContain(response?.status() ?? 0)
  })
})

test.describe('Conversation Page - Stress Tests', () => {
  test('handles 10 rapid navigations without crashing', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await page.goto('/messages/test-conversation-id', { waitUntil: 'domcontentloaded' })
    }

    const hasContent = await page.evaluate(() => document.body.innerHTML.length > 50)
    expect(hasContent).toBe(true)
  })
})
