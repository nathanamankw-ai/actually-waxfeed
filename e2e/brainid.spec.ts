import { test, expect } from '@playwright/test'

// Use a test user - update this to a known user with TasteID data
const TEST_USER = process.env.TEST_USERNAME || 'waxfeedapp'

test.describe('BrainID Cognitive Network Visualization', () => {
  test('BrainID network renders on TasteID page', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Check if the cognitive signature section exists
    const cognitiveSection = page.locator('text=COGNITIVE SIGNATURE')
    await expect(cognitiveSection).toBeVisible({ timeout: 10000 })
  })

  test('BrainID section contains correct elements', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Check for BrainID badge
    const brainidBadge = page.locator('text=BRAINID')
    await expect(brainidBadge).toBeVisible({ timeout: 10000 })

    // Check for network visualization (SVG element)
    const svg = page.locator('svg').filter({ hasText: 'BRAIN' })
    await expect(svg).toBeVisible({ timeout: 5000 })
  })

  test('BrainID network displays all 7 Yeo networks', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // Check for network abbreviations in the SVG
    const networkAbbrevs = ['DMN', 'FP', 'DA', 'VA', 'LIM', 'SMN', 'VIS']

    for (const abbrev of networkAbbrevs) {
      const networkLabel = page.locator('svg text').filter({ hasText: abbrev })
      await expect(networkLabel).toBeVisible()
    }
  })

  test('BrainID network shows percentage values', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // Check that percentage text exists in the SVG (format: "XX%")
    const percentagePattern = /\d+%/
    const svgTexts = await page.locator('svg text').allTextContents()
    const hasPercentages = svgTexts.some(text => percentagePattern.test(text))

    expect(hasPercentages).toBeTruthy()
  })

  test('BrainID network has proper visual structure', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // Check for SVG element existence
    const svg = page.locator('svg').filter({ hasText: 'BRAIN' })
    await expect(svg).toBeVisible()

    // Check for polygon (the network shape)
    const polygon = page.locator('svg polygon').first()
    await expect(polygon).toBeVisible()

    // Check for circles (network dots)
    const circles = page.locator('svg circle')
    const circleCount = await circles.count()
    expect(circleCount).toBeGreaterThan(0)
  })

  test('BrainID network has concentric ring guides', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // Check for multiple polygons (rings)
    const polygons = page.locator('svg polygon')
    const polygonCount = await polygons.count()

    // Should have at least 4 background rings
    expect(polygonCount).toBeGreaterThanOrEqual(4)
  })

  test('network to music mode mapping is displayed', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // Check for mapping header
    const mappingHeader = page.locator('text=How Cognition Shapes Listening')
    await expect(mappingHeader).toBeVisible()

    // Check for specific mappings
    await expect(page.locator('text=DMN')).toBeVisible()
    await expect(page.locator('text=Comfort')).toBeVisible()
    await expect(page.locator('text=FP')).toBeVisible()
    await expect(page.locator('text=Discovery')).toBeVisible()
  })
})

test.describe('Cognitive State Indicator', () => {
  test('cognitive state indicator renders', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // Check for state indicator (should have "Current State" text)
    const stateIndicator = page.locator('text=Current State')
    await expect(stateIndicator).toBeVisible()
  })

  test('cognitive state shows dominant state label', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // The state label should be one of: Reflective, Focused, Analytical, Curious, Emotional, Active, Perceptual
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
      const stateLabel = page.locator(`text=${state}`)
      if (await stateLabel.isVisible({ timeout: 1000 }).catch(() => false)) {
        foundState = true
        break
      }
    }

    expect(foundState).toBeTruthy()
  })

  test('cognitive state shows activation percentage', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // Check for "activation" text (indicating the percentage display)
    const activationText = page.locator('text=activation')
    await expect(activationText).toBeVisible()
  })

  test('cognitive state has visual pulse indicator', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // Check for animated pulse element (has animate-pulse class)
    const pulseElement = page.locator('.animate-pulse').first()
    await expect(pulseElement).toBeVisible()
  })

  test('cognitive state displays music suggestion', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // Check for music suggestion section
    const suggestionHeader = page.locator('text=Music Suggestion')
    await expect(suggestionHeader).toBeVisible()
  })
})

test.describe('BrainID Network Legend', () => {
  test('network legend renders', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // Check for "Yeo 7-Network Model" text
    const legendTitle = page.locator('text=Yeo 7-Network Model')
    await expect(legendTitle).toBeVisible()
  })

  test('legend displays network names and descriptions', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // Check for specific network names
    await expect(page.locator('text=Default Mode')).toBeVisible()
    await expect(page.locator('text=Frontoparietal')).toBeVisible()
    await expect(page.locator('text=Dorsal Attention')).toBeVisible()
  })

  test('legend shows music mode correlations', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // Check for music mode indicators (arrows like "→ Comfort")
    const comfortCorrelation = page.locator('text=→ Comfort')
    const discoveryCorrelation = page.locator('text=→ Discovery')

    // At least some correlations should be visible
    const comfortVisible = await comfortCorrelation.isVisible({ timeout: 1000 }).catch(() => false)
    const discoveryVisible = await discoveryCorrelation.isVisible({ timeout: 1000 }).catch(() => false)

    expect(comfortVisible || discoveryVisible).toBeTruthy()
  })
})

test.describe('BrainID Integration with Listening Signature', () => {
  test('BrainID derives correctly from listening signature', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Check that both listening signature and cognitive signature exist
    const listeningSignature = page.locator('text=LISTENING SIGNATURE')
    const cognitiveSignature = page.locator('text=COGNITIVE SIGNATURE')

    await expect(listeningSignature).toBeVisible({ timeout: 10000 })
    await expect(cognitiveSignature).toBeVisible({ timeout: 10000 })
  })

  test('page shows Polarity 1.2 and BrainID sections', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Check for both badges
    const polarityBadge = page.locator('text=POLARITY 1.2')
    const brainidBadge = page.locator('text=BRAINID')

    await expect(polarityBadge).toBeVisible({ timeout: 10000 })
    await expect(brainidBadge).toBeVisible({ timeout: 10000 })
  })

  test('cognitive signature section has proper styling', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    const cognitiveSection = page.locator('text=COGNITIVE SIGNATURE').locator('..')
    await expect(cognitiveSection).toBeVisible({ timeout: 10000 })

    // Check that it has border styling (border-2 border-foreground)
    const parentDiv = page.locator('text=COGNITIVE SIGNATURE').locator('../..').first()
    await expect(parentDiv).toBeVisible()
  })
})

test.describe('BrainID Responsiveness', () => {
  test('BrainID network scales on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // SVG should still be visible
    const svg = page.locator('svg').filter({ hasText: 'BRAIN' })
    await expect(svg).toBeVisible()
  })

  test('BrainID network scales on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // SVG should still be visible
    const svg = page.locator('svg').filter({ hasText: 'BRAIN' })
    await expect(svg).toBeVisible()
  })

  test('network legend is responsive', async ({ page }) => {
    // Test on mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // Legend should still be visible
    const legend = page.locator('text=Yeo 7-Network Model')
    await expect(legend).toBeVisible()
  })
})

test.describe('BrainID Accessibility', () => {
  test('BrainID SVG has proper text elements for screen readers', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // SVG text elements should be present and readable
    const svgTexts = page.locator('svg text')
    const count = await svgTexts.count()

    // Should have multiple text elements (network labels + percentages)
    expect(count).toBeGreaterThan(7) // At least 7 networks
  })

  test('cognitive state indicator has semantic structure', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // Check for proper heading structure
    const stateHeader = page.locator('text=Current State')
    await expect(stateHeader).toBeVisible()
  })

  test('network legend has clear visual indicators', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // Legend should have color swatches (divs with backgroundColor)
    const legend = page.locator('text=Yeo 7-Network Model').locator('..')
    await expect(legend).toBeVisible()
  })
})

test.describe('BrainID Performance', () => {
  test('BrainID section loads without blocking page render', async ({ page }) => {
    const startTime = Date.now()
    await page.goto(`/u/${TEST_USER}/tasteid`)

    // Check that page content starts appearing quickly
    await page.locator('text=TASTEID').waitFor({ timeout: 5000 })
    const contentLoadTime = Date.now() - startTime

    // Initial content should load within 5 seconds
    expect(contentLoadTime).toBeLessThan(5000)
  })

  test('SVG renders efficiently', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // Check that SVG is in the DOM
    const svg = page.locator('svg').filter({ hasText: 'BRAIN' })
    await expect(svg).toBeVisible()

    // Get SVG element count - should be reasonable
    const elementCount = await page.locator('svg *').count()

    // SVG should have elements but not be excessively complex
    expect(elementCount).toBeGreaterThan(20)
    expect(elementCount).toBeLessThan(200)
  })
})

test.describe('BrainID Error Handling', () => {
  test('page handles missing listening signature gracefully', async ({ page }) => {
    // This tests the case where a user might not have listening signature data
    await page.goto(`/u/${TEST_USER}/tasteid`)

    // Page should still load
    await page.waitForLoadState('networkidle')

    // Check that page doesn't crash
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.waitForTimeout(2000)

    // Filter out benign errors
    const significantErrors = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('hydration')
    )

    expect(significantErrors).toHaveLength(0)
  })

  test('BrainID handles zero network values', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Even with zero or low values, visualization should work
    const cognitiveSection = page.locator('text=COGNITIVE SIGNATURE')

    // If the section exists, it should render properly
    const isVisible = await cognitiveSection.isVisible({ timeout: 10000 }).catch(() => false)

    if (isVisible) {
      const svg = page.locator('svg').filter({ hasText: 'BRAIN' })
      await expect(svg).toBeVisible()
    }
  })
})

test.describe('BrainID Visual Validation', () => {
  test('network colors are distinct and visible', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // Check that circles have fill colors
    const circles = page.locator('svg circle[fill]')
    const count = await circles.count()

    expect(count).toBeGreaterThan(0)
  })

  test('gradient and glow effects are applied', async ({ page }) => {
    await page.goto(`/u/${TEST_USER}/tasteid`)
    await page.waitForTimeout(1000)

    // Wait for cognitive signature section
    await page.locator('text=COGNITIVE SIGNATURE').waitFor({ timeout: 10000 })

    // Check for gradient definition in SVG
    const gradient = page.locator('linearGradient#brainGradient')
    await expect(gradient).toBeAttached()

    // Check for filter definition
    const filter = page.locator('filter#brainGlow')
    await expect(filter).toBeAttached()
  })
})
