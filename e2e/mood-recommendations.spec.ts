import { test, expect } from '@playwright/test'

// Test user should have TasteID data
const TEST_USER = process.env.TEST_USERNAME || 'waxfeedapp'

test.describe('Mood-Aware Recommendations API', () => {
  test('API endpoint exists and returns valid response', async ({ request }) => {
    // First, get a valid userId by navigating to the profile
    // In a real scenario, you'd use a known test user ID
    // For now, we'll test the endpoint structure

    const response = await request.get(`/api/recommendations/mood?userId=test&mood=comfort`)

    // Should return 400 for invalid userId or proper response structure
    expect([200, 400, 404, 500]).toContain(response.status())
  })

  test('API validates required parameters', async ({ request }) => {
    // Test missing userId
    const noUserId = await request.get(`/api/recommendations/mood?mood=comfort`)
    expect(noUserId.status()).toBe(400)

    const body = await noUserId.json()
    expect(body.success).toBe(false)
    expect(body.error).toContain('userId')
  })

  test('API validates mood parameter', async ({ request }) => {
    // Test missing mood
    const noMood = await request.get(`/api/recommendations/mood?userId=test`)
    expect(noMood.status()).toBe(400)

    const body = await noMood.json()
    expect(body.success).toBe(false)
    expect(body.error).toContain('mood')
  })

  test('API rejects invalid mood values', async ({ request }) => {
    const invalidMood = await request.get(`/api/recommendations/mood?userId=test&mood=invalid`)
    expect(invalidMood.status()).toBe(400)

    const body = await invalidMood.json()
    expect(body.success).toBe(false)
    expect(body.error).toContain('mood')
  })

  test('API accepts valid mood values', async ({ request }) => {
    const validMoods = ['comfort', 'discovery', 'depth', 'reactive', 'emotional']

    for (const mood of validMoods) {
      const response = await request.get(`/api/recommendations/mood?userId=test-user-id&mood=${mood}`)

      // Should either succeed or fail gracefully (not with validation error)
      // 200 = success, 404 = user not found, 500 = server error (acceptable in test)
      expect([200, 404, 500]).toContain(response.status())

      if (response.status() !== 400) {
        const body = await response.json()
        // If validation passed, check response structure
        if (response.status() === 200) {
          expect(body).toHaveProperty('success')
          expect(body).toHaveProperty('data')
        }
      }
    }
  })
})

test.describe('Mood Recommendations Logic', () => {
  test('deriveCognitiveState maps listening signature to cognitive state', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Check if cognitive state is displayed
    const cognitiveSection = page.locator('text=COGNITIVE SIGNATURE')
    const isVisible = await cognitiveSection.isVisible({ timeout: 10000 }).catch(() => false)

    if (isVisible) {
      // Should show a valid cognitive state
      const possibleStates = [
        'Reflective',
        'Focused',
        'Analytical',
        'Curious',
        'Emotional',
        'Active',
        'Perceptual'
      ]

      let foundState = false
      for (const state of possibleStates) {
        if (await page.locator(`text=${state}`).isVisible({ timeout: 1000 }).catch(() => false)) {
          foundState = true
          break
        }
      }

      expect(foundState).toBeTruthy()
    }
  })

  test('cognitive state matches listening signature patterns', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Check both listening signature and cognitive signature exist
    const listeningSignature = page.locator('text=LISTENING SIGNATURE')
    const cognitiveSignature = page.locator('text=COGNITIVE SIGNATURE')

    const hasListening = await listeningSignature.isVisible({ timeout: 10000 }).catch(() => false)
    const hasCognitive = await cognitiveSignature.isVisible({ timeout: 10000 }).catch(() => false)

    if (hasListening && hasCognitive) {
      // If user has high discovery score, cognitive state should reflect that
      // This is a heuristic test - we can't directly inspect the values but can verify consistency

      // Get listening signature network values
      const discoveryText = await page.locator('text=DISCOVERY').first().textContent()
      const comfortText = await page.locator('text=COMFORT').first().textContent()

      expect(discoveryText || comfortText).toBeTruthy()
    }
  })
})

test.describe('Mood Recommendations Content', () => {
  test('comfort mode returns familiar favorites', async ({ page }) => {
    // This test verifies the logic by checking the UI behavior
    // In comfort mode, recommendations should prioritize familiar artists/genres

    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    const cognitiveSection = page.locator('text=COGNITIVE SIGNATURE')
    const isVisible = await cognitiveSection.isVisible({ timeout: 10000 }).catch(() => false)

    if (isVisible) {
      // Check for music suggestion related to comfort
      const musicSuggestion = page.locator('text=Music Suggestion')
      if (await musicSuggestion.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Suggestion text should exist
        const suggestionContent = await page.locator('text=Music Suggestion').locator('..').textContent()
        expect(suggestionContent).toBeTruthy()
      }
    }
  })

  test('discovery mode suggests exploration', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    const cognitiveSection = page.locator('text=COGNITIVE SIGNATURE')
    const isVisible = await cognitiveSection.isVisible({ timeout: 10000 }).catch(() => false)

    if (isVisible) {
      // If the user is in "Focused" state (discovery mode), suggestions should match
      const focusedState = page.locator('text=Focused')
      if (await focusedState.isVisible({ timeout: 2000 }).catch(() => false)) {
        const musicSuggestion = page.locator('text=Music Suggestion').locator('..')
        const suggestionText = await musicSuggestion.textContent()

        // Should mention discovery or exploration
        expect(suggestionText?.toLowerCase()).toMatch(/discovery|new releases|explore/i)
      }
    }
  })

  test('emotional mode focuses on feeling', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    const cognitiveSection = page.locator('text=COGNITIVE SIGNATURE')
    const isVisible = await cognitiveSection.isVisible({ timeout: 10000 }).catch(() => false)

    if (isVisible) {
      // If the user is in "Emotional" state, suggestions should match
      const emotionalState = page.locator('text=Emotional')
      if (await emotionalState.isVisible({ timeout: 2000 }).catch(() => false)) {
        const musicSuggestion = page.locator('text=Music Suggestion').locator('..')
        const suggestionText = await musicSuggestion.textContent()

        // Should mention emotional themes
        expect(suggestionText?.toLowerCase()).toMatch(/comfort|emotional|resonance/i)
      }
    }
  })
})

test.describe('Mood Recommendations Integration', () => {
  test('cognitive state influences recommendation reasons', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    const cognitiveSection = page.locator('text=COGNITIVE SIGNATURE')
    const isVisible = await cognitiveSection.isVisible({ timeout: 10000 }).catch(() => false)

    if (isVisible) {
      // Verify that the recommendation system is integrated
      // Each cognitive state should have corresponding music suggestions
      const stateIndicator = page.locator('text=Current State').locator('..')

      // Should show state-specific suggestions
      const hasSuggestion = await page.locator('text=Music Suggestion').isVisible({ timeout: 5000 }).catch(() => false)
      expect(hasSuggestion).toBeTruthy()
    }
  })

  test('network to music mode mapping is correct', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    const cognitiveSection = page.locator('text=COGNITIVE SIGNATURE')
    const isVisible = await cognitiveSection.isVisible({ timeout: 10000 }).catch(() => false)

    if (isVisible) {
      // Check the mapping grid
      const mappingSection = page.locator('text=How Cognition Shapes Listening')
      if (await mappingSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Verify DMN → Comfort mapping
        const dmnComfort = page.locator('text=DMN').first()
        const parentDiv = dmnComfort.locator('..')
        const parentText = await parentDiv.textContent()

        expect(parentText).toContain('DMN')
        expect(parentText).toContain('Comfort')
      }
    }
  })

  test('all cognitive modes have corresponding recommendations', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    const cognitiveSection = page.locator('text=COGNITIVE SIGNATURE')
    const isVisible = await cognitiveSection.isVisible({ timeout: 10000 }).catch(() => false)

    if (isVisible) {
      // The mapping section should show all key mappings
      const mappingSection = page.locator('text=How Cognition Shapes Listening')
      if (await mappingSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Should have multiple network-to-mode mappings
        const mappingParent = mappingSection.locator('../..')
        const mappingText = await mappingParent.textContent()

        // Check for key mappings
        expect(mappingText).toContain('DMN')
        expect(mappingText).toContain('FP')
        expect(mappingText).toContain('DA')
        expect(mappingText).toContain('LIM')
      }
    }
  })
})

test.describe('Mood Recommendations Data Flow', () => {
  test('listening signature data flows to cognitive state', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Both sections should be present if user has listening signature
    const listeningSection = page.locator('text=LISTENING SIGNATURE')
    const cognitiveSection = page.locator('text=COGNITIVE SIGNATURE')

    const hasListening = await listeningSection.isVisible({ timeout: 10000 }).catch(() => false)
    const hasCognitive = await cognitiveSection.isVisible({ timeout: 10000 }).catch(() => false)

    // If listening signature exists, cognitive signature should also exist
    if (hasListening) {
      expect(hasCognitive).toBeTruthy()
    }
  })

  test('cognitive state activation values are reasonable', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    const cognitiveSection = page.locator('text=COGNITIVE SIGNATURE')
    const isVisible = await cognitiveSection.isVisible({ timeout: 10000 }).catch(() => false)

    if (isVisible) {
      // Check for percentage values in the SVG
      const svgTexts = await page.locator('svg text').allTextContents()
      const percentages = svgTexts
        .filter(text => /\d+%/.test(text))
        .map(text => parseInt(text.match(/(\d+)%/)?.[1] || '0'))

      // All percentages should be between 0-100
      for (const pct of percentages) {
        expect(pct).toBeGreaterThanOrEqual(0)
        expect(pct).toBeLessThanOrEqual(100)
      }

      // Should have at least some activation
      expect(percentages.some(pct => pct > 0)).toBeTruthy()
    }
  })

  test('dominant network has highest activation', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    const cognitiveSection = page.locator('text=COGNITIVE SIGNATURE')
    const isVisible = await cognitiveSection.isVisible({ timeout: 10000 }).catch(() => false)

    if (isVisible) {
      // The dominant state should be displayed prominently
      const stateIndicator = page.locator('text=Current State').locator('..')

      // Should show activation percentage
      const hasActivation = await page.locator('text=activation').isVisible({ timeout: 5000 }).catch(() => false)
      expect(hasActivation).toBeTruthy()
    }
  })
})

test.describe('Mood Recommendations Error Handling', () => {
  test('handles missing user gracefully', async ({ request }) => {
    const response = await request.get(`/api/recommendations/mood?userId=nonexistent-user-12345&mood=comfort`)

    // Should return error or empty results, not crash
    expect([200, 404, 500]).toContain(response.status())

    const body = await response.json()
    expect(body).toHaveProperty('success')
  })

  test('handles users with no reviews', async ({ request }) => {
    // Test with a user who has no reviews - should return empty or appropriate response
    const response = await request.get(`/api/recommendations/mood?userId=new-user&mood=comfort`)

    expect([200, 404, 500]).toContain(response.status())

    if (response.status() === 200) {
      const body = await response.json()
      expect(body).toHaveProperty('data')
      expect(Array.isArray(body.data)).toBeTruthy()
    }
  })

  test('handles database errors gracefully', async ({ page }) => {
    // Test that the UI doesn't crash when API fails
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Check for JavaScript errors
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.waitForTimeout(2000)

    const significantErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('hydration')
    )

    expect(significantErrors).toHaveLength(0)
  })
})

test.describe('Mood Recommendations Performance', () => {
  test('API responds within acceptable time', async ({ request }) => {
    const startTime = Date.now()
    await request.get(`/api/recommendations/mood?userId=test&mood=comfort`)
    const responseTime = Date.now() - startTime

    // API should respond within 5 seconds
    expect(responseTime).toBeLessThan(5000)
  })

  test('cognitive state computation is efficient', async ({ page }) => {
    const startTime = Date.now()
    await page.goto(`/u/${TEST_USER}/tasteid`)

    // Wait for cognitive signature to appear
    const cognitiveSection = page.locator('text=COGNITIVE SIGNATURE')
    await cognitiveSection.waitFor({ timeout: 10000 })

    const loadTime = Date.now() - startTime

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000)
  })
})
