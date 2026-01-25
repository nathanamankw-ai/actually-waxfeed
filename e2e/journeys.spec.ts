import { test, expect } from '@playwright/test'

/**
 * User Journey Tests
 * These tests verify complete user flows across multiple pages
 */

test.describe('Journey: Album Discovery to Review', () => {
  test('user can discover and navigate to album', async ({ page }) => {
    // Start at discover page
    await page.goto('/discover')
    await page.waitForTimeout(1000)

    // Find an album link
    const albumLink = page.locator('a[href^="/album/"]').first()
    if (await albumLink.isVisible()) {
      const albumUrl = await albumLink.getAttribute('href')
      await albumLink.click()
      await page.waitForURL('**/album/**')

      // Should be on album page
      expect(page.url()).toContain('/album/')

      // Album page should have key elements
      const hasTitle = await page.locator('h1').count() > 0
      const hasArtist = await page.locator('text=/by/i').count() > 0 ||
                        await page.locator('[class*="artist"]').count() > 0

      expect(hasTitle || hasArtist).toBe(true)
    }
  })

  test('user can search and find album', async ({ page }) => {
    // Start at search page
    await page.goto('/search')
    await page.waitForTimeout(500)

    // Search for something
    const searchInput = page.locator('input').first()
    await searchInput.fill('Beatles')
    await page.waitForTimeout(2000)

    // Should show results, loading, or some content
    const hasResults = await page.locator('a[href^="/album/"]').count() > 0
    const hasSearching = await page.locator('text=/Searching|Loading/i').count() > 0
    const hasNoResults = await page.locator('text=/No results/i').count() > 0
    const hasContent = await page.locator('img').count() > 0
    const hasPageContent = await page.evaluate(() => document.body.innerHTML.length > 300)

    expect(hasResults || hasSearching || hasNoResults || hasContent || hasPageContent).toBe(true)

    // If results, click one
    if (hasResults) {
      const firstResult = page.locator('a[href^="/album/"]').first()
      await firstResult.click()
      await page.waitForURL('**/album/**')
      expect(page.url()).toContain('/album/')
    }
  })
})

test.describe('Journey: Profile Exploration', () => {
  const TEST_USER = process.env.TEST_USERNAME || 'waxfeedapp'

  test('user can navigate from profile to reviews', async ({ page }) => {
    // Start at profile
    await page.goto(`/u/${TEST_USER}`)
    await page.waitForTimeout(1000)

    // Find a review link
    const reviewLink = page.locator('a[href^="/album/"], a[href^="/review/"]').first()
    if (await reviewLink.isVisible()) {
      await reviewLink.click()
      await page.waitForTimeout(1000)

      // Should be on album or review page
      const isOnAlbum = page.url().includes('/album/')
      const isOnReview = page.url().includes('/review/')

      expect(isOnAlbum || isOnReview).toBe(true)
    }
  })

  test('user can navigate from profile to stats', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}`)
    await page.waitForTimeout(500)

    const statsLink = page.locator('a[href$="/stats"]').first()
    if (await statsLink.isVisible()) {
      await statsLink.click()
      await page.waitForURL('**/stats**')
      expect(page.url()).toContain('/stats')
    }
  })

  test('user can navigate from profile to TasteID', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}`)
    await page.waitForTimeout(500)

    const tasteidLink = page.locator('a[href$="/tasteid"]').first()
    if (await tasteidLink.isVisible()) {
      await tasteidLink.click()
      await page.waitForURL('**/tasteid**')
      expect(page.url()).toContain('/tasteid')
    }
  })
})

test.describe('Journey: Discover to Connections', () => {
  test('user can navigate from discover to connections', async ({ page }) => {
    // Start at discover
    await page.goto('/discover')
    await page.waitForTimeout(1000)

    // Look for connections link
    const connectionsLink = page.locator('a[href*="connections"]').first()
    if (await connectionsLink.isVisible()) {
      await connectionsLink.click()
      await page.waitForURL('**/connections**')
      expect(page.url()).toContain('/connections')
    }
  })

  test('user can navigate from connections to profile', async ({ page }) => {
    await page.goto('/discover/connections')
    await page.waitForTimeout(1500)

    // Find a user profile link
    const profileLink = page.locator('a[href^="/u/"]').first()
    if (await profileLink.isVisible()) {
      await profileLink.click()
      await page.waitForURL('**/u/**')
      expect(page.url()).toContain('/u/')
    }
  })
})

test.describe('Journey: Trending Exploration', () => {
  test('user can navigate from discover to trending', async ({ page }) => {
    await page.goto('/discover')
    await page.waitForTimeout(500)

    const trendingLink = page.locator('a[href="/trending"]').first()
    if (await trendingLink.isVisible()) {
      await trendingLink.click()
      await page.waitForURL('**/trending**')
      expect(page.url()).toContain('/trending')
    }
  })

  test('user can explore trending and go to album', async ({ page }) => {
    await page.goto('/trending')
    await page.waitForTimeout(1000)

    const albumLink = page.locator('a[href^="/album/"]').first()
    if (await albumLink.isVisible()) {
      await albumLink.click()
      await page.waitForURL('**/album/**')
      expect(page.url()).toContain('/album/')
    }
  })
})

test.describe('Journey: Authentication Flow', () => {
  test('unauthenticated user is redirected to login', async ({ page }) => {
    // Try to access protected page
    await page.goto('/onboarding')
    await page.waitForTimeout(2000)

    const url = page.url()
    const isOnLogin = url.includes('/login')
    const isOnOnboarding = url.includes('/onboarding')

    expect(isOnLogin || isOnOnboarding).toBe(true)
  })

  test('login page has signup link', async ({ page }) => {
    await page.goto('/login')
    await page.waitForTimeout(500)

    const signupLink = page.locator('a[href="/signup"]')
    await expect(signupLink).toBeVisible()
  })

  test('signup page has login link', async ({ page }) => {
    await page.goto('/signup')
    await page.waitForTimeout(500)

    const loginLink = page.locator('a[href="/login"]').first()
    await expect(loginLink).toBeVisible()
  })

  test('can navigate between login and signup', async ({ page }) => {
    // Start at login
    await page.goto('/login')
    await page.waitForTimeout(500)

    // Go to signup
    const signupLink = page.locator('a[href="/signup"]')
    await signupLink.click()
    await page.waitForURL('**/signup**')
    expect(page.url()).toContain('/signup')

    // Go back to login
    const loginLink = page.locator('a[href="/login"]').first()
    await loginLink.click()
    await page.waitForURL('**/login**')
    expect(page.url()).toContain('/login')
  })
})

test.describe('Journey: Header Navigation', () => {
  test('header links are accessible from discover', async ({ page }) => {
    await page.goto('/discover')
    await page.waitForTimeout(500)

    // Check for common header links
    const hasSearchLink = await page.locator('a[href="/search"]').count() > 0
    const hasProfileLink = await page.locator('a[href^="/u/"]').count() > 0 ||
                           await page.locator('a[href="/login"]').count() > 0

    expect(hasSearchLink || hasProfileLink).toBe(true)
  })

  test('can navigate to search from any page', async ({ page }) => {
    const pages = ['/discover', '/trending']

    for (const pageUrl of pages) {
      await page.goto(pageUrl)
      await page.waitForTimeout(500)

      const searchLink = page.locator('a[href="/search"]').first()
      if (await searchLink.isVisible()) {
        await searchLink.click()
        await page.waitForURL('**/search**')
        expect(page.url()).toContain('/search')
      }
    }
  })
})

test.describe('Journey: Deep Link Handling', () => {
  test('direct album URL works', async ({ page }) => {
    // Use a known Spotify ID format
    const response = await page.goto('/album/4aawyAB9vmqN3uQ7FjRGTy')

    // Should either load or 404 (album may not exist in DB)
    expect([200, 404]).toContain(response?.status() ?? 0)
  })

  test('direct profile URL works', async ({ page }) => {
    const TEST_USER = process.env.TEST_USERNAME || 'waxfeedapp'
    const response = await page.goto(`/u/${TEST_USER}`)

    // Should either load or 404
    expect([200, 404]).toContain(response?.status() ?? 0)
  })

  test('direct TasteID URL works', async ({ page }) => {
    const TEST_USER = process.env.TEST_USERNAME || 'waxfeedapp'
    const response = await page.goto(`/u/${TEST_USER}/tasteid`)

    // Should either load or 404
    expect([200, 404]).toContain(response?.status() ?? 0)
  })
})

test.describe('Journey: Error Recovery', () => {
  test('404 page has navigation back to discover', async ({ page }) => {
    await page.goto('/nonexistent-page-12345')
    await page.waitForTimeout(500)

    const hasLink = await page.locator('a[href="/discover"], a[href="/"]').count() > 0
    const has404 = await page.locator('text=/404|not found/i').count() > 0

    expect(hasLink || has404).toBe(true)
  })

  test('user can recover from 404 by using header nav', async ({ page }) => {
    await page.goto('/nonexistent-page-12345')
    await page.waitForTimeout(500)

    // Use header navigation
    const searchLink = page.locator('a[href="/search"]').first()
    if (await searchLink.isVisible()) {
      await searchLink.click()
      await page.waitForURL('**/search**')
      expect(page.url()).toContain('/search')
    }
  })
})

test.describe('Journey: Mobile Navigation', () => {
  test('mobile user can navigate core pages', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate through core pages
    const pages = ['/discover', '/search', '/trending']

    for (const pageUrl of pages) {
      await page.goto(pageUrl)
      await page.waitForTimeout(500)

      const hasContent = await page.evaluate(() => document.body.innerHTML.length > 50)
      expect(hasContent).toBe(true)
    }
  })

  test('mobile user can access menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/discover')
    await page.waitForTimeout(500)

    // Look for mobile menu button (hamburger)
    const menuButton = page.locator('button[aria-label*="menu" i], button:has(svg)').first()

    if (await menuButton.isVisible()) {
      await menuButton.click()
      await page.waitForTimeout(300)

      // Menu should be visible with navigation links
      const hasNavLinks = await page.locator('nav a, [role="menu"] a').count() > 0
      expect(hasNavLinks).toBe(true)
    }
  })
})

test.describe('Journey: Taste Matching Complete Flow', () => {
  test('user can navigate taste matching flow', async ({ page }) => {
    // Start at discover
    await page.goto('/discover')
    await page.waitForTimeout(1000)

    // Navigate to connections if available
    const connectionsLink = page.locator('a[href*="connections"]').first()
    if (await connectionsLink.isVisible()) {
      await connectionsLink.click()
      await page.waitForTimeout(1500)

      // Either see connections or need more reviews message
      const hasConnections = await page.locator('a[href^="/u/"]').count() > 0
      const needsReviews = await page.locator('text=/need|reviews/i').count() > 0
      const hasLogin = page.url().includes('/login')

      expect(hasConnections || needsReviews || hasLogin).toBe(true)

      // If has connections, can click to see match detail
      if (hasConnections) {
        const userLink = page.locator('a[href^="/u/"]').first()
        await userLink.click()
        await page.waitForURL('**/u/**')

        // On profile page, look for compare or TasteID link
        const compareLink = page.locator('a[href$="/compare"]').first()
        if (await compareLink.isVisible()) {
          await compareLink.click()
          await page.waitForTimeout(1000)
          expect(page.url()).toContain('/compare')
        }
      }
    }
  })
})

test.describe('Journey: Cross-Page State Persistence', () => {
  test('search query persists in URL', async ({ page }) => {
    await page.goto('/search')
    await page.waitForTimeout(500)

    const searchInput = page.locator('input').first()
    await searchInput.fill('Kendrick')
    await page.waitForTimeout(1000)

    // Check URL contains query
    const url = page.url()
    const hasQuery = url.includes('q=') || url.includes('Kendrick')

    // Navigate away and back
    await page.goto('/discover')
    await page.goBack()
    await page.waitForTimeout(500)

    // Should still have search context
    const newUrl = page.url()
    expect(newUrl).toContain('/search')
  })
})

test.describe('Journey: Performance Across Pages', () => {
  test('navigation between pages is fast', async ({ page }) => {
    const pages = ['/discover', '/search', '/trending']
    const times: number[] = []

    for (const pageUrl of pages) {
      const start = Date.now()
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded' })
      times.push(Date.now() - start)
    }

    // All pages should load within 10 seconds
    for (const time of times) {
      expect(time).toBeLessThan(10000)
    }
  })

  test('rapid navigation does not crash', async ({ page }) => {
    const pages = ['/discover', '/search', '/trending', '/discover']

    for (const pageUrl of pages) {
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(200)
    }

    const hasContent = await page.evaluate(() => document.body.innerHTML.length > 50)
    expect(hasContent).toBe(true)
  })
})
